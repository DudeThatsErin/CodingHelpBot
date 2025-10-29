# Assets Directory

This directory contains image and media files for the bot.

## Required Files:
- `ch_ping.png` - Image used in the ping command response
- `chbanner.png` - Banner image used in the welcome command
- `resources_banner.png` - Banner image used in the resources command
- `ch_rules.png` - Banner image used in the server-rules command

## Setup Instructions:

### For Ping Command:
1. Place your `ch_ping.png` file in this directory
2. The ping command will automatically use it as an attachment

### For Welcome Command:
1. Place your `chbanner.png` file in this directory
2. The welcome command will automatically use it as a banner attachment

### For Resources Command:
1. Place your `resources_banner.png` file in this directory
2. The resources command will automatically use it as a banner attachment

### For Server Rules Command:
1. Place your `ch_rules.png` file in this directory
2. The server-rules command will automatically use it as a banner attachment

## Fallback Behavior:
If image files are not found, the commands will work without the image attachments and display appropriate console messages.
