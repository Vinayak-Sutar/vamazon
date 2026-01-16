'use client';

/**
 * Image Gallery Component for Product Detail
 * ============================================
 * 
 * Similar to Amazon's product image section with:
 * - Main large image
 * - Thumbnail strip (when multiple images available)
 * - Zoom on hover (optional enhancement)
 */

import Image from 'next/image';
import { useState } from 'react';

interface ImageGalleryProps {
    images: string[];
    productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Ensure we have at least one image
    const displayImages = images.length > 0 ? images : ['/placeholder.png'];

    return (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            {/* Thumbnail Strip - Left side on desktop, bottom on mobile */}
            {displayImages.length > 1 && (
                <div className="order-2 sm:order-1 flex sm:flex-col gap-2 overflow-x-auto sm:overflow-x-visible">
                    {displayImages.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedIndex(index)}
                            className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 border-2 rounded ${selectedIndex === index
                                    ? 'border-[#e77600]'
                                    : 'border-gray-200 hover:border-[#e77600]'
                                } overflow-hidden bg-white`}
                        >
                            <Image
                                src={img}
                                alt={`${productName} - Image ${index + 1}`}
                                width={64}
                                height={64}
                                className="object-contain w-full h-full"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Main Image */}
            <div className="order-1 sm:order-2 flex-1">
                <div className="relative aspect-square bg-white rounded-lg overflow-hidden border border-gray-200">
                    <Image
                        src={displayImages[selectedIndex]}
                        alt={productName}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
