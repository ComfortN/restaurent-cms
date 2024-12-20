import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurantReviews } from '../reduc/slices/restaurentSlice';
import { FontAwesome } from '@expo/vector-icons';

const ReviewsSection = () => {
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
        <Text>Loading reviews...</Text>
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
        <TouchableOpacity 
          onPress={handleBackPress}
          style={styles.backButton}
        >
          <FontAwesome name="arrow-left" size={24} color="#9A3412" />
        </TouchableOpacity>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>
            Customer Reviews
          </Text>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              Total Reviews: {selectedRestaurant?.totalReviews || 0}
            </Text>
            <Text style={styles.statsText}>
              Average Rating: {selectedRestaurant?.averageRating?.toFixed(1) || 'N/A'}
            </Text>
          </View>
        </View>
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
    marginTop: 16
  },
  headerWithNav: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    padding: 15,
    paddingTop: 40
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    marginTop: 4
  },
  headerContainer: {
    flex: 1
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9A3412',
    marginBottom: 8
  },
  statsContainer: {
    backgroundColor: '#FFF7ED',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between'
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
    marginTop: 16,
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
    padding: 16,
    alignItems: 'center'
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