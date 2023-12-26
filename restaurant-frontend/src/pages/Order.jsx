import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BE_URL } from "../utils/constants";
import { SendGetRequest } from "../utils/sendRequests";

function Order(props) {
  const [orders, setOrders] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const url = `${BE_URL}/order/restaurant`;
        const { responseData } = await SendGetRequest(url);
        setOrders(responseData.orders);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, []);

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  console.log(orders);

  return orders.length === 0 ? (
    <div className="flex items-center justify-center h-screen">
      <div className="text-4xl">No Orders</div>
    </div>
  ) : (
    <div className="container mx-auto mt-5">
      {orders.map((order, index) => {
        const date = new Date(order.Date);

        const options = {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        };
        const formattedDate = date
          .toLocaleDateString("en-US", options)
          .replace(/\//g, "-");

        return (
          <div key={index} className="mb-4 border p-4 rounded shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">
              Date: {formattedDate}
            </h2>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {order.items.map((item, i) => (
                <div key={i} className="p-2 border rounded-lg cursor-pointer">
                  <div className="h-36 overflow-hidden">
                    <img
                      src={item.item.imageUrl}
                      alt={item.item.name}
                      className="w-full h-full  object-cover"
                      onClick={() => openImageModal(item.item.imageUrl)}
                    />
                  </div>
                  <p className="font-bold text-xl">{item.item.name}</p>
                  <p>
                    <Link
                      to={`/restaurant/${item.restaurant._id}`}
                      className="text-blue-500 hover:underline font-semibold"
                    >
                      {item.restaurant?.name}
                    </Link>
                  </p>
                  <p
                    className={
                      item.status.includes("accepted")
                        ? "text-green-500"
                        : item.status.includes("declined")
                        ? "text-red-500"
                        : "text-gray-500"
                    }
                  >
                    {item.status}
                  </p>
                  <p>${item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {selectedImage && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75"
          onClick={closeImageModal}
        >
          <div className="relative bg-white">
            <img
              src={selectedImage}
              alt="Full-screen"
              className="max-h-screen mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Order;
