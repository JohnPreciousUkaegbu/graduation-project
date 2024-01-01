import { Link } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid";
import { CDN_URL } from "../utils/constants";
import { useState } from "react";

const RestaurantCard = ({ restaurant }) => {
  // console.log(restaurant);
  function isURL(str) {
    try {
      new URL(str);
      return true; // Valid URL
    } catch (error) {
      return false; // Not a URL
    }
  }

  var image = isURL(restaurant.imageUrl)
    ? restaurant.imageUrl
    : `data:image/jpeg;base64,${restaurant.imageUrl}`;

  return (
    <>
      <div className="overlay-container">
        <img
          src={image}
          alt={restaurant.imageUrl}
          className="relative w-full min-h-[180px] overflow-hidden aspect-video object-cover block rounded-md"
        />
      </div>

      <h2 className="text-lg font-semibold mt-2 text-zinc-800">
        {restaurant?._doc?.name}
      </h2>
    </>
  );
};

export default RestaurantCard;

//  HOC for Top Rated Restaurants
export const withTopRatedLabel = (RestaurantCard) => {
  return (props) => {
    return (
      <div className="relative">
        <p className="absolute z-10 -top-2 -left-2 rounded-md p-2 px-4 bg-zinc-900 text-white text-xs">
          Top Rated
        </p>
        <RestaurantCard {...props} />
      </div>
    );
  };
};
