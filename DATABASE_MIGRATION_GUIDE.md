# HarvestLedger Database Migration Guide

## ✅ Migration Status: COMPLETED

Your database tables have been successfully created and are ready for use!

## 📋 Available Database Commands

### Core Migration Commands
```bash
# Create all database tables (MAIN COMMAND)
make db-create-tables

# Initialize database with tables and enums
make db-init

# Run migrations (alias for db-create-tables)
make db-migrate
```

### Database Status & Inspection
```bash
# Check database connection and table status
make db-status

# List all database tables
make db-tables

# Show detailed schema for all tables
make db-schema

# Execute PostgreSQL shell
make exec-db
```

### Data Management
```bash
# Seed database with sample data
make db-seed

# Backup database
make db-backup

# Restore from backup
make db-restore BACKUP_FILE=backups/backup_20241031_123456.sql
```

### Advanced Operations (⚠️ Destructive)
```bash
# Reset entire database (destroys all data)
make db-reset

# Recreate all tables (destroys table data only)
make db-recreate
```

## 🗄️ Current Database Schema

### Tables Created:
1. **users** - User accounts (farmers, buyers, admins)
2. **harvests** - Crop harvest records
3. **loans** - Agricultural financing
4. **transactions** - Blockchain transaction records

### Enums Created:
- `user_role` (farmer, buyer, admin)
- `harvest_status` (planted, growing, harvested, tokenized, sold)
- `loan_status` (pending, approved, active, repaid, defaulted)
- `transaction_type` (harvest_record, tokenization, loan_creation, payment, transfer)
- `croptype` (corn, wheat, soybeans, rice, cotton, tomatoes, potatoes, other)

## 🔧 What Was Fixed

1. **Model Imports**: Added proper model imports to `backend/app/main.py`
2. **Table Creation**: SQLAlchemy `Base.metadata.create_all()` now works correctly
3. **Relationships**: All foreign key relationships are properly established
4. **Enums**: PostgreSQL enums are created and working
5. **Constraints**: Primary keys, unique constraints, and indexes are in place

## 🚀 Next Steps

1. **Test the API**: Your backend should now work with all CRUD operations
2. **Add Sample Data**: Run `make db-seed` to add test data
3. **Verify Frontend**: Check that your frontend can connect to the API
4. **Monitor Logs**: Use `make logs-backend` to monitor database operations

## 🔍 Verification Commands

```bash
# Check if all services are running
make status

# Verify database tables exist
make db-tables

# Test database connection
make db-status

# Check backend health
make health-backend

# View backend logs
make logs-backend
```

## 📊 Current Status

- ✅ Database container running
- ✅ All tables created successfully
- ✅ Foreign key relationships established
- ✅ Enums and constraints in place
- ✅ Backend models properly imported
- ✅ Ready for application use

Your database migration is complete and ready for development!