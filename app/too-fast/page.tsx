import React from "react";

const Page = () => {
  return (
    <main className="root-container min-h screen flex flex-col items-center justify-center">
      <h1 className="font-bebas-neue text-light-100 text-6xl font-bold">Whoa!! Slow down</h1>
      <p className="text-light-400 mt-3 max-w-xl text-center">
        Looks like you've been a little too eager. You are trying to do too many things at once.
        Chill for a bit and try again later.
      </p>
    </main>
  );
};

export default Page;
