;; Reputation System Contract
;; This contract tracks reliability and quality of services

;; Define data maps
(define-map user-ratings
  { user: principal }
  { total-rating: uint,
    rating-count: uint,
    average-rating: uint }
)

(define-map service-ratings
  { service-id: uint }
  { rating: uint,
    comment: (string-utf8 500),
    rater: principal,
    rated-user: principal,
    created-at: uint }
)

;; Rate a service provider
(define-public (rate-service (service-id uint)
                            (provider principal)
                            (rating uint)
                            (comment (string-utf8 500)))
  (let ((user tx-sender))
    ;; Check if rating is between 1 and 5
    (asserts! (and (>= rating u1) (<= rating u5)) (err u4))

    ;; Store the rating
    (map-set service-ratings
      { service-id: service-id }
      { rating: rating,
        comment: comment,
        rater: user,
        rated-user: provider,
        created-at: block-height }
    )

    ;; Update provider's overall rating
    (match (map-get? user-ratings { user: provider })
      existing-rating
        (let ((new-total (+ (get total-rating existing-rating) rating))
              (new-count (+ (get rating-count existing-rating) u1))
              (new-average (/ new-total new-count)))
          (map-set user-ratings
            { user: provider }
            { total-rating: new-total,
              rating-count: new-count,
              average-rating: new-average }
          )
        )
      ;; If no existing rating, create new one
      (map-set user-ratings
        { user: provider }
        { total-rating: rating,
          rating-count: u1,
          average-rating: rating }
      )
    )

    (ok true)
  )
)

;; Get user's reputation
(define-read-only (get-reputation (user principal))
  (default-to
    { total-rating: u0, rating-count: u0, average-rating: u0 }
    (map-get? user-ratings { user: user })
  )
)

;; Get service rating
(define-read-only (get-service-rating (service-id uint))
  (map-get? service-ratings { service-id: service-id })
)

