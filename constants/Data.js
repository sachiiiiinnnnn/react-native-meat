import Images from '../constants/Images'; // Adjust the path if needed

export const imageData = [
  { id: '1', name: 'Chicken', source: Images. chicken },  
  { id: '2', name: 'Mutton', source: Images.fish },
  { id: '3', name: 'Fish', source: Images.chicken1 },
  { id: '4', name: 'Beaf', source: Images.fish },
  { id: '5', name: 'Egg', source: Images.chicken },
  { id: '6', name: 'Prawn', source: Images.chicken1 },
];

export const sellerData = [
  {
    id: '1',
    source: Images.loginBackground2,
    title: 'Chicken curry cut',
    description: '500g | 12-18 Pieces',
    price: '₹525', // Updated to use the Rupees symbol
    oldPrice: '₹195', // Updated to use the Rupees symbol
    discount: '22% off',
    deliveryTime: 'Today In 90 mins',
   
  },
  {
    id: '2',
    source: Images.loginBackground,
    title: 'Fish Fillet - Boneless',
    description: '500g | 4-5 Pieces',
    price: '₹200', // Updated to use the Rupees symbol
    oldPrice: '₹250', // Updated to use the Rupees symbol
    discount: '20% off',
    deliveryTime: 'Today In 90 mins',
  },
  {
    id: '3',
    source: Images.loginBackground3,
    title: 'Lamb Chops',
    description: '500g | 6-8 Pieces',
    price: '₹300', // Updated to use the Rupees symbol
    oldPrice: '₹350', // Updated to use the Rupees symbol
    discount: '15% off',
    deliveryTime: 'Today In 90 mins',
  },
  {
    id: '4',
    source: Images.muttonKheema,
    title: 'Pork Ribs',
    description: '1kg | 10-12 Pieces',
    price: '₹400', // Updated to use the Rupees symbol
    oldPrice: '₹450', // Updated to use the Rupees symbol
    discount: '10% off',
    deliveryTime: 'Today In 90 mins',
  },
  // Add more seller items as needed
];

export const shopDetails = [
  {
    id: '1',
    name: 'Sachin Chicken Shop',
    address: 'Tea kadai stop',
    rating: '4.5',
    image: Images.shop,
    distance: '100km',
    City:'Medavakkam - Chennai'
  },
  {
    id: '2',
    name: 'Fresh Fish Mart',
    address: 'Tea kadai stop',
    rating: '4.5',
    image: Images.shop,
    distance: '100km',
    City:'Medavakkam - Chennai'
  },
  {
    id: '3',
    name: 'Fresh Fish Mart',
    address: 'Tea kadai stop',
    rating: '4.5',
    image: Images.shop,
    distance: '100km',
    City:'Medavakkam - Chennai'
  },
  {
    id: '4',
    name: 'Sachin Chicken Shop',
    address: '123 Main Street, Cityville',
    rating: '4.5',
    image: Images.shop,
    distance: '100km'
  },
  {
    id: '5',
    name: 'City Meat Market',
    address: '456 Market Road, Townsville',
    rating: '4.7',
    image: Images.shop,
    distance: '100km'
  },
  {
    id: '6',
    name: 'Fresh Fish Mart',
    address: '789 Ocean Ave, Seaside',
    rating: '4.8',
    image: Images.shop,
    distance: '100km'
  },
  // Add more shop details as needed
];

export const searchMeals = [
  { id: '1', name: 'Chicken', source: Images.chicken },
  { id: '2', name: 'Mutton', source: Images.fish },
  { id: '3', name: 'Fish', source: Images.chicken1 },
  { id: '4', name: 'Prawn', source: Images.fish },
  { id: '5', name: 'Egg', source: Images.chicken },
  { id: '6', name: 'Beaf', source: Images.chicken1 },
  // { id: '7', name: 'Chicken', source: Images.chicken },
  // { id: '8', name: 'Fish', source: Images.fish },
  // { id: '9', name: 'Chicken1', source: Images.chicken1 },
  // { id: '10', name: 'Fish1', source: Images.fish },
  // { id: '11', name: 'Chicken2', source: Images.chicken },
  // { id: '12', name: 'Chicken3', source: Images.chicken1 },
  // { id: '13', name: 'Chicken', source: Images.chicken },
  // { id: '14', name: 'mutton', source: Images.fish },
  // { id: '15', name: 'Chicken1', source: Images.chicken1 },
  // { id: '16', name: 'Fish1', source: Images.fish },
  // { id: '17', name: 'Chicken2', source: Images.chicken },
  // { id: '18', name: 'beaf', source: Images.chicken1 },
  // { id: '19', name: 'Chicken', source: Images.chicken },
  // { id: '20', name: 'Fish', source: Images.fish },
  // { id: '21', name: 'Chicken1', source: Images.chicken1 },
  // { id: '22', name: 'Fish1', source: Images.fish },
  // { id: '23', name: 'Chicken2', source: Images.chicken },
  // { id: '24', name: 'Chicken3', source: Images.chicken1 },
];

//shops by category

export const chicken = [
  {
    id: '1',
    name: 'Chicken Curry cut - small pieces',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹600",
    deliveryTime: 'Today in 30mins',
    image: Images.loginBackground1, // Add the e for id '1'imag
    offer :"22%"
  },
  {
    id: '2',
    name: 'Chicken Breast - Boneless',
    uses: 'juicy bone-in & boneless',
    price: '250 g',
    pieces: "| 20 - 25 Pieces",
    money: "₹309",
    deliveryTime: 'Today in 30mins',
    image: Images.loginBackground,
    offer :"22%" // Add the image for id '2'
  },
  {
    id: '3',
    name: 'Chicken Boneless - Mini Bites',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹800",
    deliveryTime: 'Today in 30mins',
    image: Images.loginBackground2 ,
    offer :"22%" // Add the image for id '3'
  },
];

export const mutton = [
  {
    id: '1',
    name: 'Fresh Fish Mart',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹200",
    deliveryTime: 'Today in 30mins',
    image: Images.muttonKuzhambu,
    offer :"22%" // Add the image for id '1'
  },
  {
    id: '2',
    name: 'Seafood Delight',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹20",
    deliveryTime: 'Today in 30mins',
    image: Images.muttonKheema ,
    offer :"22%"// Add the image for id '2'
  },
  {
    id: '3',
    name: 'Fresh Fish Mart',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹200",
    deliveryTime: 'Today in 30mins',
    image: Images.muttonSoup,
    offer :"22%" // Add the image for id '1'
  },
  {
    id: '4',
    name: 'Seafood Delight',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹200",
    deliveryTime: 'Today in 30mins',
    image: Images.mutton,
    offer :"22%" // Add the image for id '2'
  },
];

export const fish = [
  {
    id: '1',
    name: 'City Meat Market',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹200",
    deliveryTime: 'Today in 30mins',
    image: Images.fishs,
    offer :"22%" // Add the image for id '1'
  },
  {
    id: '2',
    name: 'Quality Meat Shop',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹200",
    deliveryTime: 'Today in 30mins',
    image: Images.fish1,
    offer :"22%" // Add the image for id '2'
  },
  {
    id: '3',
    name: 'City Meat Market',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹200",
    deliveryTime: 'Today in 30mins',
    image: Images.fish2,
    offer :"22%" // Add the image for id '1'
  },
  {
    id: '4',
    name: 'Quality Meat Shop',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹200",
    deliveryTime: 'Today in 30mins',
    image: Images.fish3,
    offer :"22%" // Add the image for id '2'
  },
  {
    id: '5',
    name: 'City Meat Market',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹200",
    deliveryTime: 'Today in 30mins',
    image: Images.fish5,
    offer :"22%" // Add the image for id '1'
  },
  {
    id: '6',
    name: 'Quality Meat Shop',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹200",
    deliveryTime: 'Today in 30mins',
    image: Images.fish6,
    offer :"22%" // Add the image for id '2'
  },
];

export const beaf = [
  {
    id: '1',
    name: 'City Meat Market',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹200",
    deliveryTime: 'Today in 30mins',
    image: Images.loginBackground,
    offer :"22%" // Add the image for id '1'
  },
  {
    id: '2',
    name: 'Quality Meat Shop',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹200",
    deliveryTime: 'Today in 30mins',
    image: Images.loginBackground,
    offer :"22%" // Add the image for id '2'
  },
];

export const egg = [
  {
    id: '1',
    name: 'City Meat Market',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹200",
    deliveryTime: 'Today in 30mins',
    image: Images.loginBackground,
    offer :"22%" // Add the image for id '1'
  },
  {
    id: '2',
    name: 'Quality Meat Shop',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹200",
    deliveryTime: 'Today in 30mins',
    image: Images.loginBackground ,
    offer :"22%"// Add the image for id '2'
  },
];
export const prawn= [
    {
    id: '1',
    name: 'City Meat Market',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹200",
    deliveryTime: 'Today in 30mins',
    image: Images.loginBackground1,
    offer :"22%" // Add the image for id '1'
  },
  {
    id: '2',
    name: 'Quality Meat Shop',
    uses: 'juicy bone-in & boneless',
    price: '500 g',
    pieces: "| 12 - 18 Pieces",
    money: "₹200",
    deliveryTime: 'Today in 30mins',
    image: Images.loginBackground,
    offer :"22%" // Add the image for id '2'
  },
]