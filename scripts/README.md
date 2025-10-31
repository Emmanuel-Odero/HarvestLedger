# Scripts Directory

⚠️ **Most functionality has been moved to the main Makefile**

Use `make help` to see all available commands.

## Remaining Scripts

These scripts are kept for specialized tasks not covered by the Makefile:

### Hedera Setup Scripts

- `setup_hedera.py` - Create Hedera topics and deploy contracts
- `create_topic.py` - Create HCS topic only
- `deploy_contract.py` - Deploy smart contract only
- `install_hedera_sdk.py` - Install Hedera SDK dependencies

### Legacy Scripts (Use Makefile Instead)

- `build.sh` → `make build`
- `clean.sh` → `make clean`
- `docker-dev.sh` → `make dev`
- `test.sh` → `make test`

### Development Scripts

- `setup.py` - Complete automated setup
- `validate.py` - Validation utilities
- `git-*.sh` - Git utilities

## Migration Guide

**Old Command** → **New Command**

```bash
./scripts/start.sh        → make dev
./scripts/stop.sh         → make stop
./scripts/docker-dev.sh   → make dev
./scripts/build.sh        → make build
./scripts/clean.sh        → make clean
./scripts/test.sh         → make test
```

For all other operations, use:

```bash
make help
```
