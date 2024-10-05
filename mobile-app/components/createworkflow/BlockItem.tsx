import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Zap, Check } from 'react-native-feather';
import { Block } from '@/constants/Types';

interface BlockItemProps {
  block: Block;
  onPress: () => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({ block, onPress }) => {
  const Icon = block.type === 'action' ? Zap : Check;
  
  return (
    <TouchableOpacity
      style={[styles.block, { backgroundColor: block.color || (block.type === 'action' ? '#EF4444' : '#F59E0B') }]}
      onPress={onPress}
    >
      <Text style={styles.blockType}>{block.type}</Text>
      <Icon width={24} height={24} color="#fff" />
      <Text style={styles.blockText}>{block.text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  block: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  blockType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 16,
  },
  blockText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 16,
  },
});