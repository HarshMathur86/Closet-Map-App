# ClosetMap - Cloths Inventory App

ClosetMap is a comprehensive mobile application designed to help you organize and track your wardrobe. It allows you to digitize your closet, manage clothes, and find items quickly.

## Version Information

**Current Release:** v1.0.1
**Release Date:** 2024-01-24

### Release Notes

We are excited to announce the release of version 1.0.1. This release focuses on stability and core functionality.

- **Cloth Inventory:** The core inventory management system is stable and working as expected. You can view your entire collection with ease.
- **Add New Cloths:** The flow for adding new items to your inventory, including image capture and details (color, category, etc.), is fully functional.

## Known Issues

We are transparent about the current limitations and are actively working on the following issues for the next release:

- **Barcode Generation:** The barcode generation feature is currently experiencing issues. As a result, the scanning functionality has not been fully regression tested.
- **Color Palette:** The color selection palette is functional but limited. We are planning to expand the color options while ensuring the UI remains user-friendly.
- **Category Classification:** The current category options are broad. We are working on a more discrete and granular classification system to help you organize better.

## Getting Started

To run the project locally:

1.  **Backend:**
    ```bash
    cd backend
    npm install
    npm run dev
    ```

2.  **Mobile:**
    ```bash
    cd mobile
    npm install
    npx expo start -c
    ```

## Feedback

We welcome your feedback! Please report any additional bugs or feature requests to our issue tracker.
