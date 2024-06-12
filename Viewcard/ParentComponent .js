// ParentComponent.js

import React, { useState } from 'react';
import Home from '../screens/home';
import Shops from '../shops_category/shops';

const ParentComponent = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const handleAddItem = (item) => {
    // Logic to add item to selectedItems and update totalPrice
  };

  const handleRemoveItem = (itemId) => {
    // Logic to remove item from selectedItems and update totalPrice
  };

  return (
    <>
      <Home 
        selectedItems={selectedItems} 
        totalPrice={totalPrice} 
        handleAddItem={handleAddItem} 
        handleRemoveItem={handleRemoveItem} 
      />
      <Shops 
        selectedItems={selectedItems} 
        totalPrice={totalPrice} 
        handleAddItem={handleAddItem} 
        handleRemoveItem={handleRemoveItem} 
      />
    </>
  );
};

export default ParentComponent;
