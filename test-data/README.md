# Test Data for Import

This folder contains sample CSV files showing the expected format for CSV exports.

## How to Import

1. Export data as CSV files with these names:
   - `addresses.csv` (required)
   - `phones.csv` (optional)
   - `emails.csv` (optional)
   - `reply_status.csv` (optional)

2. Place the CSV files in this folder (`test-data/`)

3. Copy the files to `public/import-data/`:
   ```bash
   cp test-data/*.csv public/import-data/
   ```

4. Run the app and go to Import page, then click "Import All"

## File Format

See the `.sample` files for the expected column structure:

- **addresses.csv**: UUID, Created, CreatedBy, Modified, ModifiedBy, Title, Name, PostalCode, Address, Empty, Note, PrintType, StatusPerm, StatusNext
- **phones.csv**: UUID, Created, CreatedBy, Modified, ModifiedBy, Type, Number, ForeignKey
- **emails.csv**: UUID, Created, CreatedBy, Modified, ModifiedBy, Type, Address, ForeignKey
- **reply_status.csv**: UUID, Created, CreatedBy, Modified, ModifiedBy, Year, Type, ForeignKey

### Column Mapping (0-indexed)

| File | Data Columns |
|------|--------------|
| addresses | Title(5), Name(6), PostalCode(7), Address(8), Note(10), PrintType(11), StatusPerm(12), StatusNext(13) |
| phones | Type(5), Number(6), ForeignKey(7) |
| emails | Type(5), Address(6), ForeignKey(7) |
| reply_status | Year(5), Type(6), ForeignKey(7) |

### Notes

- The ForeignKey in phones/emails/reply_status must match the UUID (column 0) in addresses.csv
- Line endings can be `\r\n`, `\n`, or `\r` (Mac classic)
- Fields with commas or quotes must be enclosed in double quotes
- Empty records (no number/email/year) are skipped during import
