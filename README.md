# ecossistema-mobile

**Aplicacao Movel para Cidadaos -- Embaixada de Angola na Alemanha**

Parte do [Ecossistema Digital da Embaixada de Angola na Alemanha](https://github.com/embaixada-angola-alemanha/ecossistema-project).

Aplicacao movel (Android e iOS) que permite aos cidadaos angolanos na Alemanha aceder aos servicos consulares a partir do telemovel: consultar perfil, acompanhar vistos, marcar agendamentos, gerir documentos e receber noticias da embaixada.

---

## Stack Tecnologica

| Camada | Tecnologia |
|---|---|
| Framework | React Native 0.76.6 |
| Linguagem | TypeScript 5.7 |
| Navegacao | React Navigation 7 (stack + bottom tabs) |
| Estado (servidor) | TanStack React Query 5 |
| Estado (local) | Zustand 5 |
| HTTP | Axios 1.7 |
| Autenticacao | react-native-app-auth (OIDC/Keycloak) |
| Biometria | react-native-biometrics |
| Armazenamento Seguro | react-native-keychain |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| i18n | i18next + react-i18next |
| Ficheiros | react-native-fs, react-native-document-picker, react-native-image-picker |
| QR Code | react-native-qrcode-svg |
| Icones | react-native-vector-icons |
| OTA Updates | CodePush |
| Offline | AsyncStorage + sync queue customizada |
| Conectividade | @react-native-community/netinfo |
| Datas | date-fns 4 |
| Testes Unitarios | Jest 29 + ts-jest |
| Testes E2E | Detox 20 |
| Linting | ESLint 9 + Prettier 3 |

---

## Estrutura do Projecto

```
/
  App.tsx                           # Componente raiz (QueryClient, navegacao, push, sync)
  babel.config.js                   # Configuracao Babel
  tsconfig.json                     # Configuracao TypeScript
  package.json                      # Dependencias e scripts
  android/                          # Projecto nativo Android
  ios/                              # Projecto nativo iOS
  assets/                           # Recursos estaticos (imagens, fontes)
  e2e/                              # Testes E2E (Detox)
  __tests__/                        # Testes unitarios

src/
  config/                           # Configuracoes da aplicacao
    env.ts                          #   Variaveis de ambiente (API URLs, Keycloak, feature flags)
    theme.ts                        #   Tema visual (cores, espacamento, tipografia, bordas)
    i18n.ts                         #   Configuracao de internacionalizacao
  navigation/                       # Estrutura de navegacao
    AppNavigator.tsx                #   Navegador principal (auth vs main)
    AuthNavigator.tsx               #   Stack de autenticacao (login, splash)
    MainTabNavigator.tsx            #   Tab bar principal (home, profile, etc.)
    types.ts                        #   Tipos de navegacao
  screens/                          # Ecras da aplicacao
    auth/
      LoginScreen.tsx               #   Ecra de login (Keycloak OIDC)
      SplashScreen.tsx              #   Ecra de carregamento / restauro de sessao
    home/
      HomeScreen.tsx                #   Dashboard principal do cidadao
    profile/
      ProfileScreen.tsx             #   Perfil do cidadao
    documents/
      DocumentsListScreen.tsx       #   Lista de documentos
    visa/
      VisaApplyScreen.tsx           #   Pedido e acompanhamento de vistos
    appointments/
      AppointmentsListScreen.tsx    #   Lista de agendamentos
      AppointmentDetailScreen.tsx   #   Detalhe do agendamento
      NewAppointmentScreen.tsx      #   Marcar novo agendamento
    news/
      NewsListScreen.tsx            #   Lista de noticias (do servico WN)
      NewsDetailScreen.tsx          #   Detalhe da noticia
    settings/
      SettingsScreen.tsx            #   Definicoes (idioma, notificacoes, biometria)
  services/                         # Servicos e camada de dados
    api.ts                          #   Cliente HTTP base (Axios + interceptors)
    auth.ts                         #   Autenticacao OIDC (Keycloak)
    cidadao.ts                      #   API de cidadaos (SGC)
    visto.ts                        #   API de vistos (SGC)
    agendamento.ts                  #   API de agendamentos (SGC)
    documento.ts                    #   API de documentos (SGC)
    biometric.ts                    #   Autenticacao biometrica
    secure-storage.ts               #   Armazenamento seguro de tokens
    jwt-decode.ts                   #   Decodificacao de JWT
    push-notifications.ts           #   Registo e gestao de push notifications (FCM)
    offline-cache.ts                #   Cache offline com expiracao
    sync-queue.ts                   #   Fila de operacoes pendentes (offline)
    sync-processor.ts               #   Processamento automatico da fila de sync
    ota-update.ts                   #   Actualizacoes OTA via CodePush
  hooks/                            # React hooks customizados
    useProfile.ts                   #   Dados do perfil do cidadao
    useVistos.ts                    #   Pedidos de visto
    useAgendamentos.ts              #   Agendamentos
    useProcessos.ts                 #   Processos consulares
    useOffline.ts                   #   Estado de conectividade e modo offline
  store/                            # Estado global
    auth-store.ts                   #   Store de autenticacao (Zustand)
  components/                       # Componentes reutilizaveis
    common/                         #   Componentes genericos (botoes, cards, etc.)
    profile/                        #   Componentes de perfil
    documents/                      #   Componentes de documentos
    visa/                           #   Componentes de vistos
  types/                            # Tipos TypeScript
    auth.ts                         #   Tipos de autenticacao
    cidadao.ts                      #   Tipos de cidadao
    visto.ts                        #   Tipos de visto
    agendamento.ts                  #   Tipos de agendamento
    documento.ts                    #   Tipos de documento
    api.ts                          #   Tipos de resposta API
  utils/                            # Utilitarios
```

---

## Funcionalidades Principais

### Autenticacao
- Login via Keycloak (OIDC / Authorization Code + PKCE)
- Restauro automatico de sessao
- Autenticacao biometrica (fingerprint / Face ID)
- Armazenamento seguro de tokens (Keychain)

### Dashboard
- Resumo dos servicos do cidadao
- Processos activos e estado
- Proximos agendamentos
- Notificacoes recentes

### Vistos
- Submissao de pedidos de visto
- Acompanhamento do estado em tempo real
- Upload de documentos necessarios

### Agendamentos
- Consulta de disponibilidade
- Marcacao de agendamento consular
- Detalhe com data, hora e servico

### Documentos
- Lista de documentos submetidos
- Upload de novos documentos
- Download e partilha de documentos

### Noticias
- Feed de noticias da embaixada (servico WN)
- Detalhe de cada noticia

### Modo Offline
- Cache local de dados consultados
- Fila de operacoes pendentes (sync queue)
- Sincronizacao automatica ao restaurar conectividade
- Expiracao periodica de cache

### Push Notifications
- Notificacoes via Firebase Cloud Messaging (FCM)
- Alertas de estado de processos, agendamentos e vistos

### Actualizacoes OTA
- CodePush para actualizacoes sem passar pela app store

---

## Tema Visual

Paleta de cores inspirada na identidade angolana:

| Cor | Hex | Uso |
|---|---|---|
| Primary (Embassy Green) | `#1B4332` | Cor principal |
| Accent (Gold) | `#D4A020` | Acentos e destaques |
| Ember (Welwitschia) | `#C4512D` | Cor secundaria |
| Background | `#F8F9FA` | Fundo da aplicacao |
| Surface | `#FFFFFF` | Cards e superficies |

---

## Como Executar

### Pre-requisitos

- Node.js 20+
- React Native CLI
- Android Studio (para Android) ou Xcode 15+ (para iOS)
- JDK 17+ (para build Android)

### Desenvolvimento Local

```bash
# Clonar o repositorio
git clone https://github.com/embaixada-angola-alemanha/ecossistema-mobile.git
cd ecossistema-mobile

# Instalar dependencias
npm install

# Instalar pods iOS (macOS)
cd ios && pod install && cd ..

# Iniciar Metro bundler
npm start

# Executar no Android
npm run android

# Executar no iOS (macOS)
npm run ios
```

### Testes

```bash
# Testes unitarios (Jest)
npm test

# Testes E2E -- Android (Detox)
npm run e2e:build:android
npm run e2e:test:android

# Testes E2E -- iOS (Detox)
npm run e2e:build:ios
npm run e2e:test:ios
```

### Limpeza

```bash
# Limpar builds nativos (Android + iOS)
npm run clean
```

---

## Configuracao de Ambiente

### Variaveis de Ambiente

As variaveis sao geridas pelo `react-native-config` e definidas em ficheiros `.env`:

| Variavel | Descricao | Default (dev) |
|---|---|---|
| `API_BASE_URL` | URL base da API | `http://10.0.2.2:8081/api/v1` |
| `SGC_API_URL` | URL da API SGC | `http://10.0.2.2:8081/api/v1` |
| `WN_API_URL` | URL da API WN (noticias) | `http://10.0.2.2:8083/api/v1/public` |
| `KEYCLOAK_URL` | URL do Keycloak | `http://10.0.2.2:8080` |
| `KEYCLOAK_REALM` | Realm do Keycloak | `ecossistema` |
| `KEYCLOAK_CLIENT_ID` | Client ID (OIDC) | `mobile-app` |
| `KEYCLOAK_REDIRECT_URI` | URI de redirect | `ao.gov.embaixada.mobile://callback` |
| `BIOMETRIC_ENABLED` | Activar biometria | `true` |
| `PUSH_ENABLED` | Activar push notifications | `true` |

### APIs Consumidas

| Servico | Descricao |
|---|---|
| **SGC Backend** (porta 8081) | Cidadaos, vistos, agendamentos, documentos |
| **WN Backend** (porta 8083) | Noticias e conteudo publico |
| **Keycloak** (porta 8080) | Autenticacao OIDC |

---

## Projecto Principal

Este repositorio faz parte do **Ecossistema Digital da Embaixada de Angola na Alemanha**.

Repositorio principal: https://github.com/embaixada-angola-alemanha/ecossistema-project
