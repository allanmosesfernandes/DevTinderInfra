# Connection requests router

## Sender

- POST /request/send/interested/:userId
- POST /request/send/ignored/:userId
- POST /request/send/accepted/:userId
- POST /request/send/rejected/:userId

### Receiver

- POST /request/review/:status/:userId
Status: ignore,interested, accepted, rejected

### User router

- GET /user/connections = get all connections for a user
