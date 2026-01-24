import React from "react";
import Link from "next/link";
import Image from "next/image";
import BookCover from "./BookCover";
import { cn } from "@/lib/utils";

const BookCard = ({
  id,
  title,
  author,
  genre,
  coverColor,
  coverUrl,
  isLoanedBook = false,
}: Book) => (
  <li className={cn(isLoanedBook && "xs:w-52 w-full")}>
    <Link href={`/book/${id}`} className={cn(isLoanedBook && "flex w-full flex-col items-center")}>
      <BookCover coverColor={coverColor} coverImage={coverUrl} />

      <div className={cn(!isLoanedBook && "xs:max-w-40 max-w-28")}>
        <p className="book-title">{title}</p>
        <p className="book-genre">{genre}</p>
      </div>

      {isLoanedBook && (
        <div className="mt-3 w-full">
          <div className="book-loaned">
            <Image src="/icons/loaned.svg" alt="Loaned" width={20} height={20} />
            <p className="text-light-100">15 days left to return</p>
          </div>

          <button className="book-btn">Download Receipt</button>
        </div>
      )}
    </Link>
  </li>
);

export default BookCard;
