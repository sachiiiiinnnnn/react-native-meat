import { StyleSheet, Image, View, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { searchMeals } from '../constants/Data'; // Adjust the path if needed
import icons from '../constants/Icons'; // Adjust the path if needed
import { useNavigation } from '@react-navigation/native';

const numColumns = 3;

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMeals, setFilteredMeals] = useState(searchMeals);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredMeals(searchMeals);
    } else {
      const filteredData = searchMeals.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMeals(filteredData);
    }
  }, [searchQuery]);

  const handleSearchIconClick = () => {
    setIsSearchActive(true);
  };

  const handleSearchResultClick = (item) => {
    navigation.navigate('Shops', { category: item.name });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {!isSearchActive && (
          <TouchableOpacity onPress={handleSearchIconClick}>
            <Image source={icons.search} style={styles.searchIcon} />
          </TouchableOpacity>
        )}
        {isSearchActive && (
          <TextInput
            style={styles.input}
            placeholder="Search for any products"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        )}
      </View>

      <FlatList
        data={filteredMeals}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemContainer} onPress={() => handleSearchResultClick(item)}>
            <Image source={item.source} style={styles.image} resizeMode="cover" />
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.searchItems}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchContainer: {
    paddingTop: 70, // Adjust this value as needed
    paddingHorizontal: 20,
    backgroundColor: 'white', // Change to the desired background color
    flexDirection: 'row', // Add this line to position the icon and input field in a row
    alignItems: 'center', // Center items vertically
  },
  searchIcon: {
    width: 24,
    height: 24,
    tintColor: 'black',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginLeft: 10, // Add some space between the icon and input field
    flex: 1, // Allow the input field to take the remaining space
  },
  searchItems: {
    padding: 10,
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    margin: 10,
    maxWidth: 100, // Adjust this value as needed for a good fit
  },
  image: {
    width: 80, // Fixed width for image
    height: 80, // Fixed height for image
    borderRadius: 50,
  },
  itemText: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Search;
