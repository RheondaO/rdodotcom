#!/usr/bin/env python3
import struct
import zlib

def create_sparkle_favicon():
    # Create 32x32 PNG with sparkle design matching the header
    width, height = 32, 32
    pixels = []
    
    for y in range(height):
        row = []
        for x in range(width):
            # Default transparent
            r, g, b, a = 0, 0, 0, 0
            
            # Rounded rectangle background with gradient (pink to purple)
            if (x >= 2 and x <= 29 and y >= 2 and y <= 29):
                # Check if inside rounded corners
                corner_radius = 6
                in_corner = False
                
                # Top-left corner
                if x < 2 + corner_radius and y < 2 + corner_radius:
                    dist = ((x - (2 + corner_radius))**2 + (y - (2 + corner_radius))**2)**0.5
                    if dist > corner_radius:
                        in_corner = True
                
                # Top-right corner
                elif x > 29 - corner_radius and y < 2 + corner_radius:
                    dist = ((x - (29 - corner_radius))**2 + (y - (2 + corner_radius))**2)**0.5
                    if dist > corner_radius:
                        in_corner = True
                
                # Bottom-left corner
                elif x < 2 + corner_radius and y > 29 - corner_radius:
                    dist = ((x - (2 + corner_radius))**2 + (y - (29 - corner_radius))**2)**0.5
                    if dist > corner_radius:
                        in_corner = True
                
                # Bottom-right corner
                elif x > 29 - corner_radius and y > 29 - corner_radius:
                    dist = ((x - (29 - corner_radius))**2 + (y - (29 - corner_radius))**2)**0.5
                    if dist > corner_radius:
                        in_corner = True
                
                if not in_corner:
                    # Gradient from pink to purple
                    gradient_pos = (x + y) / 60.0  # 0 to 1
                    r = int(244 + (139 - 244) * gradient_pos)  # Pink to purple R
                    g = int(114 + (92 - 114) * gradient_pos)   # Pink to purple G  
                    b = int(180 + (246 - 180) * gradient_pos)  # Pink to purple B
                    a = 255
            
            # White border
            if ((x >= 1 and x <= 30 and (y == 1 or y == 30)) or 
                (y >= 1 and y <= 30 and (x == 1 or x == 30))):
                # Check rounded corners for border
                corner_radius = 6
                draw_border = True
                
                if ((x <= 1 + corner_radius and y <= 1 + corner_radius) or
                    (x >= 30 - corner_radius and y <= 1 + corner_radius) or
                    (x <= 1 + corner_radius and y >= 30 - corner_radius) or
                    (x >= 30 - corner_radius and y >= 30 - corner_radius)):
                    draw_border = False
                
                if draw_border:
                    r, g, b, a = 255, 255, 255, 255
            
            # Main star (center)
            if ((x == 16 and y >= 6 and y <= 18) or
                (y == 12 and x >= 10 and x <= 22) or
                (abs(x - 16) + abs(y - 12) <= 6 and 
                 ((x - 16) * (y - 12) >= 0 or abs(x - 16) <= 2 or abs(y - 12) <= 2))):
                r, g, b, a = 255, 255, 255, 255
            
            # Small star top right
            if ((x == 24 and y >= 8 and y <= 12) or
                (y == 10 and x >= 22 and x <= 26) or
                (abs(x - 24) + abs(y - 10) <= 2)):
                r, g, b, a = 255, 255, 255, int(255 * 0.8)
            
            # Small star bottom left
            if ((x == 8 and y >= 20 and y <= 24) or
                (y == 22 and x >= 6 and x <= 10) or
                (abs(x - 8) + abs(y - 22) <= 2)):
                r, g, b, a = 255, 255, 255, int(255 * 0.8)
            
            # Tiny star bottom right (circle)
            if ((x - 25)**2 + (y - 22)**2 <= 1.5**2):
                r, g, b, a = 255, 255, 255, int(255 * 0.6)
            
            row.extend([r, g, b, a])
        pixels.extend(row)
    
    # Create PNG file
    def write_png(filename, width, height, pixels):
        def write_chunk(f, chunk_type, data):
            f.write(struct.pack('>I', len(data)))
            f.write(chunk_type)
            f.write(data)
            crc = zlib.crc32(chunk_type + data) & 0xffffffff
            f.write(struct.pack('>I', crc))
        
        with open(filename, 'wb') as f:
            f.write(b'\x89PNG\r\n\x1a\n')
            
            # IHDR
            ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
            write_chunk(f, b'IHDR', ihdr)
            
            # IDAT
            raw_data = b''.join(b'\x00' + bytes(pixels[i:i+width*4]) 
                               for i in range(0, len(pixels), width*4))
            compressed = zlib.compress(raw_data)
            write_chunk(f, b'IDAT', compressed)
            
            # IEND
            write_chunk(f, b'IEND', b'')
    
    # Create 32x32
    write_png('favicon-32x32.png', 32, 32, pixels)
    
    # Create 16x16 by sampling every other pixel
    small_pixels = []
    for y in range(0, 32, 2):
        for x in range(0, 32, 2):
            idx = (y * 32 + x) * 4
            small_pixels.extend(pixels[idx:idx+4])
    
    write_png('favicon-16x16.png', 16, 16, small_pixels)
    
    print("Sparkle favicon files created successfully")

if __name__ == "__main__":
    create_sparkle_favicon()
