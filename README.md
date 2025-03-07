# Sistema para Comerciantes

Um aplicativo móvel desenvolvido com React Native e Expo para gerenciar vendas, produtos e fluxo de caixa para pequenos comerciantes.

## Funcionalidades

- Cadastro e gerenciamento de produtos
- Registro de vendas
- Livro caixa
- Alerta de produtos com estoque baixo
- Configurações personalizáveis

## Requisitos

- Node.js 16.x ou superior
- npm 8.x ou superior
- Expo CLI
- Conta no Expo.dev (gratuita)

## Instalação

Clone o repositório e instale as dependências:

```bash
# Clone o repositório
git clone https://seu-repositorio/sistema-comerciantes.git
cd sistema-comerciantes

# Instale as dependências
npm install
```

## Executando o projeto em desenvolvimento

```bash
# Inicie o servidor de desenvolvimento Expo
npx expo start
```

Após iniciar o servidor, você verá um QR code no terminal:

- Para Android: Escaneie o QR code usando o aplicativo Expo Go
- Para iOS: Escaneie o QR code usando a câmera do dispositivo
- Para emulador: Pressione 'a' no terminal para abrir em emulador Android

## Como gerar um APK para Android

### Usando EAS Build (Método Atual)

1. Instale o EAS CLI:

```bash
npm install -g eas-cli
```

2. Faça login na sua conta Expo:

```bash
eas login
```

3. Configure o projeto para build:

```bash
eas build:configure
```

4. Crie um arquivo eas.json na raiz do projeto:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

5. Inicie o build do APK:

```bash
eas build -p android --profile preview
```

6. Após a conclusão do build (pode levar alguns minutos), o EAS fornecerá um link para download do APK.

### Desenvolvimento local (sem enviar para servidores Expo)

Para testar em um dispositivo local sem gerar APK:

1. Instale o aplicativo Expo Go no dispositivo Android
2. Execute `npx expo start` no projeto
3. Escaneie o QR code com o aplicativo Expo Go

## Estrutura do Projeto

```
sistema-comerciantes/
├── App.js                  # Ponto de entrada do aplicativo
├── navigation/             # Arquivos de navegação
├── src/
│   ├── assets/             # Imagens e outros recursos
│   ├── database/           # Configuração do banco de dados SQLite
│   ├── screens/            # Telas do aplicativo
│   └── services/           # Serviços para acesso ao banco de dados
├── eas.json                # Configuração do EAS Build
└── package.json            # Dependências do projeto
```

## Credenciais de Login

Para acessar o sistema:

- Usuário: `sistema`
- Senha: `sistema`

## Configurações

O aplicativo permite configurações personalizáveis:

- Definir o valor mínimo de estoque para alertas
- Reset do banco de dados (senha: admin)

## Solução de Problemas

### Erro de AsyncStorage

Se encontrar o erro "Unable to resolve @react-native-async-storage/async-storage":

```bash
npx expo install @react-native-async-storage/async-storage
```

### Erro de inicialização do Banco de Dados

Se o aplicativo mostrar erro na inicialização do banco:

1. Verifique se o módulo expo-sqlite está instalado:

```bash
npx expo install expo-sqlite
```

2. Limpe o cache do Expo:

```bash
npx expo start -c
```

### Problemas no build com EAS

Se o build falhar com EAS, tente:

```bash
eas build:list
```

Para ver o status dos seus builds, e:

```bash
eas build:logs
```

Para investigar os logs de erro.
