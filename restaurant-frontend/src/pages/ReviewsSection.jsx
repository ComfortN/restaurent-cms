import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurantReviews } from '../reduc/slices/restaurentSlice';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';


const ReviewsSection = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { reviews, isLoading, selectedRestaurant } = useSelector(state => state.restaurants);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    loadReviews();
  }, [currentPage]);
  console.log('seletedt restURANT', selectedRestaurant)
  const loadReviews = () => {
    if (user?.restaurantId) {
      dispatch(fetchRestaurantReviews({
        restaurantId: user.restaurantId,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      }));
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FontAwesome
        key={index}
        name={index < rating ? "star" : "star-o"}
        size={16}
        color={index < rating ? "#FFD700" : "#BDC3C7"}
        style={{ marginRight: 2 }}
      />
    ));
  };

  const renderReviewItem = ({ item }) => {
    if (!item) return null;

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewerName}>
            {item.userId?.name || 'Anonymous'}
          </Text>
          <View style={styles.ratingContainer}>
            {renderStars(item.rating)}
          </View>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.commentText}>{item.comment}</Text>
      </View>
    );
  };

  const renderPagination = () => {
    if (!reviews?.items?.length) return null;

    const totalPages = reviews.totalPages || 1;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity 
          style={[
            styles.paginationButton,
            currentPage === 1 && styles.paginationButtonDisabled
          ]}
          onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <Text style={styles.paginationButtonText}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.paginationText}>
          Page {currentPage} of {totalPages}
        </Text>
        <TouchableOpacity 
          style={[
            styles.paginationButton,
            currentPage === totalPages && styles.paginationButtonDisabled
          ]}
          onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          <Text style={styles.paginationButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B44E13" />
      </View>
    );
  }

  if (!user?.restaurantId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Restaurant information not available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerWithNav}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <FontAwesome5 name="arrow-left" size={20} color="white" />
      </TouchableOpacity>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>
            Customer Reviews
          </Text>
          
        </View>
      </View>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Total Reviews: {selectedRestaurant?.totalReviews || 0}
        </Text>
        <Text style={styles.statsText}>
          Average Rating: {selectedRestaurant?.averageRating?.toFixed(1) || 'N/A'}
        </Text>
      </View>

      <FlatList
        data={reviews?.items || []}
        renderItem={renderReviewItem}
        keyExtractor={item => item?._id?.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No reviews yet</Text>
        }
        contentContainerStyle={styles.listContainer}
      />

      {renderPagination()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7BF90'
  },
  headerWithNav: {
    backgroundColor: '#B44E13',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40
  },
  backButton: {
    marginRight: 15
  },
  headerContainer: {
    flex: 1
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8
  },
  statsContainer: {
    backgroundColor: '#FFF7ED',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    margin: 10
  },
  statsText: {
    color: '#9A3412',
    fontWeight: '600'
  },
  reviewCard: {
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  reviewerName: {
    fontWeight: '600',
    color: '#9A3412',
    fontSize: 18
  },
  dateText: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 8
  },
  commentText: {
    color: '#374151'
  },
  starContainer: {
    flexDirection: 'row'
  },
  star: {
    width: 16,
    height: 16,
    marginRight: 2
  },
  starFilled: {
    color: '#FBBF24'
  },
  starEmpty: {
    color: '#D1D5DB'
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 15,
    paddingHorizontal: 8
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#FFF7ED'
  },
  paginationButtonDisabled: {
    backgroundColor: '#D1D5DB'
  },
  paginationButtonText: {
    color: '#9A3412',
    fontWeight: '600'
  },
  paginationText: {
    color: '#4B5563'
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F7BF90',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white'
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center'
  },
  errorText: {
    color: '#9A3412',
    fontSize: 18,
    textAlign: 'center'
  },
  emptyText: {
    color: '#4B5563',
    textAlign: 'center',
    padding: 16
  },
  listContainer: {
    paddingHorizontal: 16
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});

export default ReviewsSection;