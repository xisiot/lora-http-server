# lora-network-server
An Open-source implementation of LoRa-Network-Server by Node.js

## Requirements

- Node.js (>= 8)
- MySQL (>= 5.7)
- Redis
- Mongo
- Kafka

## Startup

Use `pm2` to manage the processes and run `pm2 start`, or just tap in `node bin/lora-network-server`.

## ApiDoc

Creates an apiDoc of all routes to dir public/, and visit `ip:port` to view the document.

```
apidoc -i lib/routes -o public/
```

