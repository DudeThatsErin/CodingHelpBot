const axios = require('axios');

/**
 * Search for images using Google Custom Search API
 * @param {string} searchQuery - The search query for images
 * @returns {string|null} - Image URL or null if no image found
 */
async function searchGoogleImages(searchQuery) {
    try {
        const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
        const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;
        
        if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
            console.log('Google API credentials not configured, skipping image search');
            return null;
        }
        
        // Google Custom Search API URL
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=10&safe=active`;
        
        const response = await axios.get(searchUrl);
        
        if (response.data && response.data.items && response.data.items.length > 0) {
            // Get a random image from the search results
            const randomIndex = Math.floor(Math.random() * response.data.items.length);
            const imageUrl = response.data.items[randomIndex].link;
            
            console.log(`Found image for "${searchQuery}": ${imageUrl}`);
            return imageUrl;
        } else {
            console.log(`No images found for "${searchQuery}"`);
            return null;
        }
        
    } catch (error) {
        console.error('Error fetching image from Google:', error.message);
        return null;
    }
}

module.exports = { searchGoogleImages };
