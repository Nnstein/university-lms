import Image from "next/image";
import React from "react";
import { cn } from "@/lib/utils";
import BookCoverSvg from "./BookCoverSvg";

type BookCoverVariant = "extra-small" | "small" | "medium" | "regular" | "wide";

const variantStyles: Record<BookCoverVariant, string> = {
  "extra-small": "book-cover_extra_small",
  small: "book-cover_small",
  medium: "book-cover_medium",
  regular: "book-cover_regular",
  wide: "book-cover_wide",
};

interface Props {
  variant?: BookCoverVariant;
  className?: string;
  coverColor?: string;
  coverImage?: string;
}

const BookCover = ({
  variant = "regular",
  className,
  coverColor = "#012B48",
  coverImage = "https://placehold.co/400x600.png",
}: Props) => {
  return (
    <div className={cn("relative transition-all duration-300", variantStyles[variant], className)}>
      {/* Book spine/side effect */}
      <div
        className="absolute inset-y-0 left-0 w-3 rounded-l-sm"
        style={{ backgroundColor: coverColor }}
      />

      <BookCoverSvg coverColor={coverColor} />
      <div className="absolute z-10" style={{ left: "12%", width: "87.5%", height: "88%" }}>
        <Image src={coverImage} alt="Book Cover" fill className="rounded-sm object-fill" />
      </div>
    </div>
  );
};

export default BookCover;
