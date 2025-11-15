import '@testing-library/jest-dom';

// Set NODE_ENV to test to ensure React loads in development mode
process.env.NODE_ENV = 'test';

// Mock react-native-paper for native tests
jest.mock('react-native-paper', () => {
  const React = require('react');
  const Card = ({ children, ...props }: any) => React.createElement('div', props, children);
  (Card as any).Content = ({ children, ...props }: any) => React.createElement('div', props, children);
  (Card as any).Actions = ({ children, ...props }: any) => React.createElement('div', props, children);
  
  return {
    Button: ({ children, onPress, disabled, ...props }: any) =>
      React.createElement('button', { onClick: onPress, disabled, ...props }, children),
    TextInput: ({ value, onChangeText, placeholder, secureTextEntry, ...props }: any) =>
      React.createElement('input', {
        value,
        onChange: (e: any) => onChangeText?.(e.target.value),
        placeholder,
        type: secureTextEntry ? 'password' : 'text',
        ...props,
      }),
    Card,
    Text: ({ children, ...props }: any) => React.createElement('span', props, children),
    Chip: ({ children, ...props }: any) => React.createElement('span', props, children),
    IconButton: ({ icon, onPress, ...props }: any) =>
      React.createElement('button', { onClick: onPress, ...props }, icon),
    SegmentedButtons: ({ value, onValueChange, buttons, ...props }: any) =>
      React.createElement('div', props, 
        buttons?.map((btn: any) =>
          React.createElement('button', {
            key: btn.value,
            onClick: () => onValueChange?.(btn.value),
          }, btn.label)
        )
      ),
    PaperProvider: ({ children }: any) => children,
  };
});

