# Decentralized Community Skill Exchange

A blockchain-based platform for community members to exchange skills and services without monetary transactions, built on the Stacks blockchain using Clarity smart contracts.

## Overview

This project implements a decentralized skill exchange system where community members can:

1. Register their skills and expertise
2. Request services from other members
3. Provide services to earn time credits
4. Build reputation through quality service

The system operates on a time-banking model, where one hour of service equals one time credit, regardless of the type of service provided.

## Smart Contracts

### Skill Registry Contract

The Skill Registry contract allows users to:
- Register skills with descriptions and categories
- Update their skill information
- Remove skills they no longer offer
- Query skills by user or category

### Service Exchange Contract

The Service Exchange contract manages the trading of services:
- Create service requests
- Accept service requests from other users
- Mark services as completed
- Track service history

### Reputation System Contract

The Reputation System contract builds trust in the community:
- Rate service providers after completion
- Calculate reputation scores
- Query reputation by user

### Time Banking Contract

The Time Banking contract tracks the exchange of time:
- Record time contributions
- Track time balance for each user
- Transfer time credits between users
- View transaction history

## Getting Started

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) - Clarity development environment
- [Node.js](https://nodejs.org/) - For running tests

### Installation

1. Clone the repository:

