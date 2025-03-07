import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    
    
    setTimeout(() => {
      if (username === 'sistema' && password === 'sistema') {
        setIsLoading(false);
        navigation.navigate('Home');
      } else {
        setIsLoading(false);
        Alert.alert('Erro', 'Usuário ou senha incorretos!');
      }
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        {/* Logomarca */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/logomarca.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Usuário"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Carregando...' : 'Entrar'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F75908', 
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: width * 0.5,  
    height: width * 0.5, 
    backgroundColor: 'white',
    borderRadius: width * 0.25, 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
  },
  logo: {
    width: '80%',  
    height: '80%', 
    
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#FFF', 
  },
  input: {
    width: '80%', 
    height: 55,
    backgroundColor: 'white',
    borderRadius: 12, 
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 0,
    fontSize: 16,
    textAlign: 'center', 
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  button: {
    width: '80%', 
    height: 55,
    backgroundColor: '#333', 
    borderRadius: 12, 
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
