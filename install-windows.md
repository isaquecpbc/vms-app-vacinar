# VMS App — Guia de Instalação e Build no Windows

> Ambiente testado: Windows 11, Node 22 (nvm), sem Android Studio

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Clonar e alternar branch](#2-clonar-e-alternar-branch)
3. [Instalar JDK Adoptium (Temurin)](#3-instalar-jdk-adoptium-temurin)
4. [Instalar Android SDK (sem Android Studio)](#4-instalar-android-sdk-sem-android-studio)
5. [Configurar variáveis de ambiente](#5-configurar-variáveis-de-ambiente)
6. [Configurar local.properties](#6-configurar-localproperties)
7. [Instalar dependências e sincronizar Capacitor](#7-instalar-dependências-e-sincronizar-capacitor)
8. [Build Android com Gradle](#8-build-android-com-gradle)
9. [Dev server no navegador](#9-dev-server-no-navegador)
10. [Referência rápida de comandos](#10-referência-rápida-de-comandos)

---

## 1. Pré-requisitos

| Programa | Versão usada | Como instalar |
|---|---|---|
| Git | qualquer | `winget install Git.Git` |
| Node.js (via nvm) | 22.x | `nvm install 22` / `nvm use 22` |
| npm | 10.x | incluído com Node |
| winget | incluído no Windows 11 | — |
| curl.exe | incluído no Windows 10/11 | — |

> **Atenção:** O Capacitor CLI exige Node >= 20. Node 18 **não funciona** com Capacitor 7.

Para verificar qual Node está ativo:
```powershell
node --version
# deve retornar v20.x.x ou superior (usamos v22.12.0)
```

Para alternar versão com nvm:
```powershell
nvm use 22
```

---

## 2. Clonar e alternar branch

```powershell
# Clonar o repositório (se ainda não tiver localmente)
git clone <URL_DO_REPOSITORIO>
cd vms-app

# Baixar e alternar para a branch mobile_first
git fetch origin mobile_first
git checkout mobile_first

# Confirmar branch ativa
git branch --show-current
```

---

## 3. Instalar JDK Adoptium (Temurin)

O projeto usa Capacitor 7, que exige **Java 21** para compilar plugins como `@capacitor/filesystem`.
O JDK 17 também foi instalado, mas **o build efetivo requer o JDK 21**.

### Instalar via winget

```powershell
# JDK 17 (opcional, referência)
winget install EclipseAdoptium.Temurin.17.JDK --accept-package-agreements --accept-source-agreements

# JDK 21 (OBRIGATÓRIO para Capacitor 7)
winget install EclipseAdoptium.Temurin.21.JDK --accept-package-agreements --accept-source-agreements
```

### Caminhos instalados

| JDK | Caminho |
|---|---|
| 17 | `C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot` |
| 21 | `C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot` |

---

## 4. Instalar Android SDK (sem Android Studio)

### 4.1 Baixar Android Command-Line Tools

```powershell
# Criar pasta do SDK
New-Item -ItemType Directory -Force "C:\Android\Sdk\cmdline-tools"

# Baixar as command-line tools (usar curl.exe para suporte correto a redirect)
curl.exe -L -o "C:\Android\cmdline-tools.zip" `
  "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
```

### 4.2 Extrair e organizar na estrutura correta

O zip extrai uma pasta `cmdline-tools\`. O `sdkmanager` exige que ela se chame `latest`:

```powershell
# Extrair
Expand-Archive -Path "C:\Android\cmdline-tools.zip" `
               -DestinationPath "C:\Android\Sdk\cmdline-tools" -Force

# Renomear para 'latest' (estrutura obrigatória)
Rename-Item "C:\Android\Sdk\cmdline-tools\cmdline-tools" "latest"

# Verificar
Get-ChildItem "C:\Android\Sdk\cmdline-tools\latest\bin"
# deve listar: sdkmanager.bat, avdmanager.bat, etc.
```

### 4.3 Instalar componentes do SDK

> Execute no PowerShell com `JAVA_HOME` e `ANDROID_HOME` já configurados (veja seção 5).

```powershell
# Aceitar licenças e instalar platform-tools, SDK 35 e build-tools 35
echo "y" | sdkmanager --sdk_root="C:\Android\Sdk" `
    "platform-tools" `
    "platforms;android-35" `
    "build-tools;35.0.0"
```

### Componentes instalados

| Componente | Versão |
|---|---|
| platform-tools | mais recente |
| platforms;android-35 | API 35 |
| build-tools;35.0.0 | 35.0.0 |
| build-tools;34.0.0 | instalado automaticamente pelo Gradle |
| cmdline-tools | 12.0 |

---

## 5. Configurar variáveis de ambiente

### Configuração permanente (User scope)

```powershell
# JAVA_HOME — aponta para JDK 21
[System.Environment]::SetEnvironmentVariable(
    "JAVA_HOME",
    "C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot",
    "User"
)

# ANDROID_HOME
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android\Sdk", "User")

# ANDROID_SDK_ROOT (alias usado por algumas ferramentas)
[System.Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", "C:\Android\Sdk", "User")
```

### Ativar na sessão atual do PowerShell

```powershell
$env:JAVA_HOME    = "C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
$env:ANDROID_HOME = "C:\Android\Sdk"
$env:PATH         = "$env:JAVA_HOME\bin;C:\Android\Sdk\cmdline-tools\latest\bin;C:\Android\Sdk\platform-tools;" + $env:PATH
```

### Verificar

```powershell
java -version
# openjdk version "21.0.10" ...

sdkmanager --version
# 12.0
```

---

## 6. Configurar local.properties

O arquivo `android\local.properties` precisa apontar para o SDK local.
Ele **não é versionado** (está no `.gitignore`), então precisa ser criado/editado manualmente.

```powershell
# Conteúdo correto para Windows (barras escapadas)
# Arquivo: android\local.properties
sdk.dir=C\:\\Android\\Sdk
```

> **Atenção:** o caminho usa `\:` para escapar os dois pontos e `\\` para as barras.
> Não use o caminho Linux `/home/usuario/Android/Sdk` que pode vir do histórico do git.

---

## 7. Instalar dependências e sincronizar Capacitor

```powershell
# Na raiz do projeto
cd c:\projetos\vms-app

# Instalar dependências npm
npm install

# Build do Ionic/Angular (gera a pasta www/)
npx ng build --configuration production
# ou equivalentemente:
# npx ionic build

# Copiar assets e sincronizar plugins Capacitor com o projeto Android
npx cap sync android
```

> O `cap sync` falha se a pasta `www/` não existir. Sempre rode o build antes.

---

## 8. Build Android com Gradle

```powershell
# Garantir variáveis de ambiente na sessão
$env:JAVA_HOME    = "C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
$env:ANDROID_HOME = "C:\Android\Sdk"
$env:PATH         = "$env:JAVA_HOME\bin;" + $env:PATH

# Entrar na pasta android e executar o build
cd c:\projetos\vms-app\android
.\gradlew.bat assembleDebug
```

### APK gerado

```
android\app\build\outputs\apk\debug\app-debug.apk  (~56 MB)
```

### Outros targets Gradle úteis

```powershell
# Build release (requer configuração de keystore)
.\gradlew.bat assembleRelease

# Limpar build anterior
.\gradlew.bat clean

# Build + instalar no dispositivo/emulador conectado via USB
.\gradlew.bat installDebug

# Listar todas as tasks disponíveis
.\gradlew.bat tasks
```

---

## 9. Dev server no navegador

Para testar a aplicação no browser sem precisar gerar o APK:

```powershell
cd c:\projetos\vms-app

# Iniciar o servidor de desenvolvimento (abre o browser automaticamente)
npx ng serve --open

# Ou sem abrir o browser automaticamente
npx ng serve
```

Acesse: **http://localhost:4200**

Para parar o servidor: `Ctrl+C` no terminal.

### Opções úteis do ng serve

```powershell
# Porta personalizada
npx ng serve --port 4201

# Permitir acesso de outros dispositivos na rede local
npx ng serve --host 0.0.0.0

# Usar configuração de produção (sem hot reload)
npx ng serve --configuration production
```

---

## 10. Referência rápida de comandos

### Fluxo completo de build Android (do zero)

```powershell
# 1. Configurar ambiente na sessão
$env:JAVA_HOME    = "C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
$env:ANDROID_HOME = "C:\Android\Sdk"
$env:PATH         = "$env:JAVA_HOME\bin;" + $env:PATH
nvm use 22

# 2. Ir para o projeto
cd c:\projetos\vms-app

# 3. Instalar dependências (apenas na primeira vez ou após mudanças no package.json)
npm install

# 4. Build dos assets web
npx ng build --configuration production

# 5. Sincronizar com Android
npx cap sync android

# 6. Build do APK
cd android
.\gradlew.bat assembleDebug
```

### Fluxo de desenvolvimento no browser

```powershell
nvm use 22
cd c:\projetos\vms-app
npx ng serve --open
```

### Atualizar apenas os assets no Android (sem rebuild completo)

```powershell
npx ng build --configuration production
npx cap copy android
# Depois reinstalar via adb ou abrir no Android Studio
```

---

## Estrutura de pastas relevante

```
C:\Android\
  Sdk\
    cmdline-tools\
      latest\
        bin\
          sdkmanager.bat
          avdmanager.bat
    platform-tools\     ← adb.exe fica aqui
    platforms\
      android-35\
    build-tools\
      35.0.0\
      34.0.0\
    licenses\

C:\Program Files\Eclipse Adoptium\
  jdk-17.0.18.8-hotspot\
  jdk-21.0.10.7-hotspot\   ← JAVA_HOME aponta aqui
```

---

## Observações e avisos conhecidos

| Aviso | Significado | Ação necessária |
|---|---|---|
| `chrome 60` ignorado no Browserslist | Versão muito antiga sem suporte a ES5 | Nenhuma — pode ignorar |
| `package="..."` no AndroidManifest.xml | Atributo depreciado no AGP 8+ | Remover o atributo `package` do `AndroidManifest.xml` futuramente |
| `flatDir` no build.gradle | Formato sem metadados, depreciado | Inerente ao Capacitor, pode ignorar |
| Gradle incompatível com 9.0 | Features depreciadas no Gradle 8 | Aguardar atualização de plugins/Capacitor |
| `@capacitor-community/http@1.4.1` sem suporte oficial ao Capacitor 7 | Plugin desatualizado | Avaliar migração para `@capacitor/http` nativo |
