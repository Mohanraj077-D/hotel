let roomTypes = [];

export function setRoomTypes(types) {
  roomTypes = types;
}

export function createRoomOptions(basePrice) {
  if (!roomTypes || roomTypes.length === 0) return [];

  return roomTypes.map(({ priceMultiplier, ...room }) => ({
    ...room,
    price: priceMultiplier === 1
      ? basePrice
      : Math.round((basePrice * priceMultiplier) / 100) * 100,
  }));
}

export function getRoomOptions(hotel) {
  if (Array.isArray(hotel.roomOptions) && hotel.roomOptions.length > 0) {
    return hotel.roomOptions;
  }

  return createRoomOptions(Number(hotel.price) || 2499);
}
