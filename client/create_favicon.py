#!/usr/bin/env python3
import struct
import zlib

def create_png_favicon():
    # Simple 32x32 PNG with Belle Journal design
    width, height = 32, 32
    
    # Create RGBA data for a circular badge with "B"
    pixels = []
    center_x, center_y = 16, 16
    radius = 14
    
    for y in range(height):
        row = []
        for x in range(width):
            # Distance from center
            dist = ((x - center_x) ** 2 + (y - center_y) ** 2) ** 0.5
            
            if dist <= radius:
                # Inside circle - gradient purple background
                intensity = 1.0 - (dist / radius) * 0.3
                r = int(139 * intensity)  # Purple
                g = int(92 * intensity)
                b = int(246 * intensity)
                a = 255
                
                # Draw "B" letter
                if (x >= 10 and x <= 12 and y >= 8 and y <= 23) or \
                   (x >= 10 and x <= 17 and y >= 8 and y <= 10) or \
                   (x >= 10 and x <= 16 and y >= 14 and y <= 16) or \
                   (x >= 10 and x <= 18 and y >= 21 and y <= 23) or \
                   (x >= 15 and x <= 17 and y >= 11 and y <= 13) or \
                   (x >= 16 and x <= 18 and y >= 17 and y <= 20):
                    r, g, b = 255, 255, 255  # White for "B"
                
            else:
                # Outside circle - transparent
                r, g, b, a = 0, 0, 0, 0
            
            row.extend([r, g, b, a])
        pixels.extend(row)
    
    # Create PNG
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
    
    # Create both sizes
    write_png('favicon-32x32.png', 32, 32, pixels)
    
    # Create 16x16 by sampling every other pixel
    small_pixels = []
    for y in range(0, 32, 2):
        for x in range(0, 32, 2):
            idx = (y * 32 + x) * 4
            small_pixels.extend(pixels[idx:idx+4])
    
    write_png('favicon-16x16.png', 16, 16, small_pixels)
    
    print("Favicon files created successfully")

if __name__ == "__main__":
    create_png_favicon()
