import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock the Clarity contract interactions
const mockUserRatings = new Map()
const mockServiceRatings = new Map()

// Mock contract functions
const mockContractFunctions = {
  rateService: (serviceId, provider, rating, comment) => {
    const user = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM" // Mock user principal
    
    // Mock service-exchange contract call to verify service
    const serviceRequest = {
      requester: user,
      status: "completed",
      provider: provider,
    }
    
    // Check if rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return { error: 4 } // Invalid rating error
    }
    
    // Store the rating
    mockServiceRatings.set(JSON.stringify({ serviceId }), {
      rating,
      comment,
      rater: user,
      ratedUser: provider,
      createdAt: 123, // Mock block height
    })
    
    // Update provider's overall rating
    const userRatingsKey = JSON.stringify({ user: provider })
    const existingRating = mockUserRatings.get(userRatingsKey)
    
    if (existingRating) {
      const newTotal = existingRating.totalRating + rating
      const newCount = existingRating.ratingCount + 1
      const newAverage = Math.floor(newTotal / newCount)
      
      mockUserRatings.set(userRatingsKey, {
        totalRating: newTotal,
        ratingCount: newCount,
        averageRating: newAverage,
      })
    } else {
      mockUserRatings.set(userRatingsKey, {
        totalRating: rating,
        ratingCount: 1,
        averageRating: rating,
      })
    }
    
    return { value: true }
  },
  
  getReputation: (user) => {
    const key = JSON.stringify({ user })
    return mockUserRatings.get(key) || { totalRating: 0, ratingCount: 0, averageRating: 0 }
  },
  
  getServiceRating: (serviceId) => {
    const key = JSON.stringify({ serviceId })
    return mockServiceRatings.get(key)
  },
}

// Mock the contract calls
vi.mock("@stacks/transactions", () => ({
  callReadOnlyFunction: vi.fn((contractAddress, contractName, functionName, args) => {
    if (functionName === "get-reputation") {
      return mockContractFunctions.getReputation(args[0].value)
    } else if (functionName === "get-service-rating") {
      return mockContractFunctions.getServiceRating(args[0].value)
    }
    return null
  }),
  
  broadcastTransaction: vi.fn((transaction) => {
    if (transaction.functionName === "rate-service") {
      return mockContractFunctions.rateService(
          transaction.functionArgs[0].value,
          transaction.functionArgs[1].value,
          transaction.functionArgs[2].value,
          transaction.functionArgs[3].value,
      )
    }
    return null
  }),
}))

describe("Reputation System Contract", () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockUserRatings.clear()
    mockServiceRatings.clear()
  })
  
  it("should rate a service provider", async () => {
    const provider = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    const result = mockContractFunctions.rateService(
        0, // Service ID
        provider,
        5, // 5-star rating
        "Excellent service, very professional",
    )
    
    expect(result.value).toBe(true)
    
    const serviceRating = mockContractFunctions.getServiceRating(0)
    
    expect(serviceRating).toEqual({
      rating: 5,
      comment: "Excellent service, very professional",
      rater: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      ratedUser: provider,
      createdAt: 123,
    })
  })
  
  it("should calculate average rating correctly", async () => {
    const provider = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    
    // Add multiple ratings
    mockContractFunctions.rateService(0, provider, 5, "Excellent")
    mockContractFunctions.rateService(1, provider, 4, "Very good")
    mockContractFunctions.rateService(2, provider, 3, "Good")
    
    const reputation = mockContractFunctions.getReputation(provider)
    
    expect(reputation).toEqual({
      totalRating: 12,
      ratingCount: 3,
      averageRating: 4, // 12/3 = 4
    })
  })
  
  it("should reject invalid ratings", async () => {
    const provider = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    
    // Try to add an invalid rating (6 stars)
    const result = mockContractFunctions.rateService(0, provider, 6, "Too many stars")
    
    expect(result.error).toBe(4) // Invalid rating error
    
    // Verify no rating was stored
    const serviceRating = mockContractFunctions.getServiceRating(0)
    expect(serviceRating).toBeUndefined()
  })
  
  it("should return default values for users with no ratings", async () => {
    const user = "ST3YFXPS524JJMM6N74VACP94SNZX1QZHJNPYG5D7"
    const reputation = mockContractFunctions.getReputation(user)
    
    expect(reputation).toEqual({
      totalRating: 0,
      ratingCount: 0,
      averageRating: 0,
    })
  })
})

