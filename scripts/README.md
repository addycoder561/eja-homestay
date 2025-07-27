# Image URL Generation Script

This script automatically fetches all images from your Supabase Storage folders and generates URLs for your spreadsheet.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env.local` file in your project root with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase Dashboard > Settings > API.

### 3. Check Your Setup
```bash
npm run check-env
```

### 4. Run the Script
```bash
npm run generate-images
```

## 📁 Expected Storage Structure

Your Supabase Storage should be organized like this:
```
properties/
├── property-1/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── image3.jpg
├── property-2/
│   ├── photo1.png
│   └── photo2.jpg
└── property-3/
    ├── main.jpg
    └── gallery1.webp
```

## 📄 Output Files

The script generates two files:

1. **`property-images.json`** - Detailed JSON with all image data
2. **`property-images.csv`** - CSV format ready for spreadsheet import

## 🔧 Configuration

Edit `scripts/generate-image-urls.js` to change:
- `BUCKET_NAME` - Your Supabase Storage bucket name (default: 'properties')
- `OUTPUT_FILE` - Output JSON filename

## 💡 Usage Tips

1. **For Spreadsheet**: Use the CSV file and copy the "Image URLs" column
2. **For Code**: Use the JSON file to integrate with your application
3. **Image Separator**: URLs are separated by semicolons (;) in CSV format

## 🐛 Troubleshooting

- **"Bucket not found"**: Check your bucket name in Supabase Storage
- **"No images found"**: Ensure your folders contain image files (.jpg, .png, .gif, .webp, .svg)
- **"Environment variables missing"**: Run `npm run check-env` for guidance 