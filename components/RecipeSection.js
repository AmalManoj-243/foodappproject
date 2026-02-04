import { View, Text, StyleSheet } from 'react-native';

export function IngredientsList({ ingredients }) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Ingredients</Text>
      {ingredients.map((ing, i) => (
        <View key={i} style={styles.ingredientRow}>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.ingredientItem}>{ing.item}</Text>
          <Text style={styles.ingredientQty}>{ing.qty}</Text>
        </View>
      ))}
    </View>
  );
}

export function StepsList({ steps }) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>How to Prepare</Text>
      {steps.map((step, i) => (
        <View key={i} style={styles.stepRow}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{i + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dot: {
    fontSize: 16,
    color: '#e67e22',
    marginRight: 8,
  },
  ingredientItem: {
    flex: 1,
    fontSize: 15,
    color: '#444',
  },
  ingredientQty: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e67e22',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
});
