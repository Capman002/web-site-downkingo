# 🦅 Resumo do Projeto: DownKingo (v2)

> Documentação arquitetural completa do projeto, organizada por camadas funcionais.  
> **Branch:** `feat/v2-protected` | **Última atualização:** Janeiro 2026

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Backend (Go)](#️-backend-go)
3. [Frontend (React + TypeScript)](#-frontend-react--typescript)
4. [Infraestrutura & CI/CD](#️-infraestrutura--cicd)
5. [Documentação](#-documentação)

---

## 🎯 Visão Geral

**DownKingo** é um aplicativo desktop multiplataforma para download e conversão de mídia, construído com:

- **Backend:** Go + Wails v2 (framework desktop)
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Framer Motion
- **Persistência:** SQLite (via go-sqlite3)
- **Binários externos:** yt-dlp, FFmpeg, aria2c, rembg

### Funcionalidades Principais

| Categoria               | Recursos                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| **Downloads**           | YouTube, Instagram, Twitter/X, TikTok, e 1000+ sites via yt-dlp                          |
| **Conversão**           | Vídeo (MP4, WebM, AVI, MKV), Áudio (MP3, AAC, FLAC, WAV), Imagens (PNG, JPG, WebP, AVIF) |
| **IA**                  | Remoção de fundo de imagens via rembg (modelos U2Net, ISNET)                             |
| **Produtividade**       | Monitor de clipboard, atalhos de teclado, fila de downloads                              |
| **Social**              | Roadmap público "Build in Public", votação de features via GitHub                        |
| **Internacionalização** | 5 idiomas (pt-BR, en-US, es-ES, fr-FR, de-DE)                                            |

---

## 🏗️ Backend (Go)

O backend é construído sobre o framework **Wails v2**, atuando como ponte entre o sistema operacional e a interface web.

### 📁 Estrutura de Diretórios

```
internal/
├── app/           # Paths e configuração de binários
├── auth/          # Autenticação GitHub (Device Flow)
├── clipboard/     # Monitor de área de transferência
├── config/        # Sistema de configuração (JSON + env vars)
├── constants/     # Constantes globais
├── converter/     # Conversão de mídia (vídeo, áudio, imagem, background)
├── downloader/    # Gerenciador de fila de downloads
├── errors/        # Tipos de erro customizados
├── events/        # Sistema de eventos Wails
├── handlers/      # Handlers de negócio (converter, media, settings, system, video)
├── images/        # Download e processamento de imagens
├── instagram/     # Parser de carrossel Instagram
├── interfaces/    # Interfaces compartilhadas
├── launcher/      # Download automático de dependências
├── logger/        # Logger estruturado
├── ratelimit/     # Rate limiting para APIs
├── roadmap/       # Integração com GitHub Projects (Build in Public)
├── storage/       # Persistência SQLite
├── twitter/       # Parser de mídia Twitter/X
├── updater/       # Auto-update via GitHub Releases
├── validate/      # Validadores de URL e dados
└── youtube/       # Wrapper para yt-dlp
```

---

### 🔌 Entry Points & App Lifecycle

#### `main.go`

Ponto de entrada da aplicação. Configura o Wails e inicializa a struct `App`.

#### `app.go` (Facade Principal)

Struct `App` que expõe **66 métodos** ao frontend via bindings Wails:

**Lifecycle:**

- `OnStartup(ctx)` — Inicialização de serviços, DB, handlers e monitors
- `Shutdown(ctx)` — Limpeza de recursos, fechamento de DB

**Campos Principais:**

- `ctx` — Contexto Wails para eventos
- `paths` — Gerenciador de caminhos de binários
- `db` — Conexão SQLite
- `downloadRepo` — Repositório de downloads
- `cfg` — Configuração carregada
- `clipboardMonitor` — Monitor de clipboard
- `roadmapService` — Serviço de roadmap
- `authService` — Autenticação GitHub

---

### ⬇️ Download Manager

**Localização:** `internal/downloader/manager.go`

Gerencia a fila de downloads com suporte a múltiplos jobs simultâneos.

| Método                           | Descrição                                                 |
| -------------------------------- | --------------------------------------------------------- |
| `AddJob(url, format, audioOnly)` | Adiciona download simples à fila                          |
| `AddToQueueAdvanced(opts)`       | Download com opções avançadas (qualidade, legendas, etc.) |
| `CancelJob(id)`                  | Cancela download em andamento                             |
| `GetQueue()`                     | Retorna downloads pendentes/em progresso                  |
| `GetHistory(limit)`              | Retorna histórico de downloads concluídos                 |
| `ClearHistory()`                 | Limpa histórico completo                                  |

**Eventos emitidos:**

- `download:progress` — Progresso em tempo real (%, velocidade, ETA)
- `download:complete` — Download finalizado
- `download:error` — Erro no download
- `console:log` — Logs do yt-dlp para o terminal

---

### 🎬 YouTube / yt-dlp Wrapper

**Localização:** `internal/youtube/`

Wrapper completo para o yt-dlp com suporte a:

| Funcionalidade         | Descrição                                                |
| ---------------------- | -------------------------------------------------------- |
| `GetVideoInfo(url)`    | Extrai metadados (título, duração, formatos, thumbnails) |
| `Download(opts)`       | Download com opções customizadas                         |
| `UpdateYtDlp(channel)` | Atualiza yt-dlp (stable/nightly)                         |

**Struct `DownloadOptions`:**

- `URL` — URL do vídeo
- `Format` — Formato de saída (mp4, webm, mp3, etc.)
- `Quality` — Qualidade (best, 1080p, 720p, etc.)
- `AudioOnly` — Extrair apenas áudio
- `Subtitles` — Baixar legendas
- `SubtitleLang` — Idioma das legendas
- `OutputPath` — Diretório de saída
- `UseAria2c` — Usar aria2c para downloads paralelos

---

### 🔄 Converter & Media Handlers

**Localização:** `internal/converter/`, `internal/handlers/converter.go`, `media.go`

#### Conversão de Vídeo

| Método                                 | Descrição                                   |
| -------------------------------------- | ------------------------------------------- |
| `ConvertVideo(req)`                    | Converte para MP4, WebM, AVI, MKV, MOV, GIF |
| `CompressVideo(path, quality, preset)` | Comprime vídeo (ultrafast → veryslow)       |
| `ExtractAudio(req)`                    | Extrai áudio para MP3, AAC, FLAC, WAV, OGG  |

#### Conversão de Imagem

| Método                         | Descrição                                     |
| ------------------------------ | --------------------------------------------- |
| `ConvertImage(req)`            | Converte para PNG, JPG, WebP, AVIF, BMP, TIFF |
| `CompressImage(path, quality)` | Comprime com controle de qualidade (1-100)    |
| `RemoveBackground(req)`        | Remoção de fundo via IA (rembg)               |

**Struct `ConversionResult`:**

- `outputPath` — Caminho do arquivo convertido
- `inputSize` / `outputSize` — Tamanhos em bytes
- `compression` — Percentual de compressão
- `success` / `errorMessage` — Status

---

### 🖼️ Images Handler

**Localização:** `internal/images/`

| Método                         | Descrição                                      |
| ------------------------------ | ---------------------------------------------- |
| `GetImageInfo(url)`            | Extrai metadados de imagem remota              |
| `DownloadImage(url, filename)` | Download direto de imagem                      |
| `GetInstagramCarousel(url)`    | Extrai todas as imagens de carrossel Instagram |

---

### 🐦 Social Media Parsers

**Localização:** `internal/instagram/`, `internal/twitter/`

| Plataforma    | Funcionalidade                                   |
| ------------- | ------------------------------------------------ |
| **Instagram** | Extração de carrossel (múltiplas imagens/vídeos) |
| **Twitter/X** | Extração de mídia de tweets                      |

---

### ⚙️ Settings Handler

**Localização:** `internal/handlers/settings.go`, `internal/config/`

| Método                   | Descrição                               |
| ------------------------ | --------------------------------------- |
| `GetSettings()`          | Retorna configuração atual              |
| `SaveSettings(cfg)`      | Salva configuração no disco             |
| `SelectDirectory()`      | Abre diálogo nativo de seleção de pasta |
| `SelectVideoDirectory()` | Pasta específica para vídeos            |
| `SelectImageDirectory()` | Pasta específica para imagens           |

**Struct `Config`:**

- `DownloadPath` — Pasta padrão de downloads
- `VideoDownloadPath` — Pasta para vídeos
- `ImageDownloadPath` — Pasta para imagens
- `DefaultFormat` — Formato padrão (mp4, mp3, etc.)
- `DefaultQuality` — Qualidade padrão
- `ClipboardMonitor` — Habilitar/desabilitar monitor
- `Theme` — Tema da interface (light/dark/system)
- `Language` — Idioma da interface
- `UseAria2c` — Usar aria2c por padrão
- `RoadmapConfig` — Configuração CDN do roadmap

---

### 🔐 Auth Service (GitHub)

**Localização:** `internal/auth/service.go`

Implementa **Device Flow** do GitHub para autenticação sem servidor.

| Método                       | Descrição                                              |
| ---------------------------- | ------------------------------------------------------ |
| `StartGitHubAuth()`          | Inicia fluxo, retorna `user_code` e `verification_url` |
| `PollGitHubAuth(deviceCode)` | Aguarda autorização do usuário                         |
| `GetGitHubToken()`           | Retorna token armazenado                               |
| `LogoutGitHub()`             | Remove token                                           |

**Fluxo:**

1. Usuário chama `StartGitHubAuth()`
2. App exibe código e URL de verificação
3. Usuário autoriza no navegador
4. App detecta autorização via polling
5. Token armazenado para uso futuro

---

### 🗺️ Roadmap Service (Build in Public)

**Localização:** `internal/roadmap/`

Integração com GitHub Projects para exibir roadmap público.

| Método                        | Descrição                              |
| ----------------------------- | -------------------------------------- |
| `GetRoadmap(lang)`            | Busca itens do roadmap (CDN ou GitHub) |
| `VoteFeature(issueID)`        | Adiciona reação 👍 na issue            |
| `VoteDownFeature(issueID)`    | Remove reação 👍                       |
| `SuggestFeature(title, desc)` | Cria nova issue de sugestão            |

**Arquitetura:**

- **CDN (Cloudflare Pages):** Cache de `roadmap.json` para performance
- **GitHub API:** Votação direta para manter atribuição do usuário
- **Cache local:** Fallback quando offline

**Struct `RoadmapItem`:**

- `id` — ID da issue
- `title` — Título original
- `friendly_title` — Título traduzido via IA
- `description` — Descrição em Markdown
- `status` — Status no Project (Backlog, In Progress, Done)
- `votes` — Contagem de reações
- `userVoted` — Se o usuário atual votou
- `labels` — Labels da issue

---

### 🚀 Launcher (Dependency Manager)

**Localização:** `internal/launcher/launcher.go`

Gerencia download automático de binários externos.

| Dependência | Descrição                            |
| ----------- | ------------------------------------ |
| **yt-dlp**  | Downloader de vídeo (obrigatório)    |
| **FFmpeg**  | Processamento de mídia (obrigatório) |
| **aria2c**  | Acelerador de downloads (opcional)   |
| **rembg**   | Remoção de fundo via IA (opcional)   |

| Método                             | Descrição                             |
| ---------------------------------- | ------------------------------------- |
| `CheckDependencies()`              | Verifica status de cada dependência   |
| `NeedsDependencies()`              | Retorna `true` se algo está faltando  |
| `DownloadDependencies()`           | Baixa todas as dependências faltantes |
| `DownloadAria2c()`                 | Instala aria2c sob demanda            |
| `DownloadRembg()`                  | Instala rembg via pip/standalone      |
| `DeleteRembg()` / `DeleteAria2c()` | Remove dependências opcionais         |

**Eventos emitidos:**

- `launcher:progress` — Progresso de download (nome, %, velocidade)
- `launcher:complete` — Instalação concluída

---

### 🔄 Updater (Auto-Update)

**Localização:** `internal/updater/updater.go`

Auto-atualização via GitHub Releases.

| Método                        | Descrição                          |
| ----------------------------- | ---------------------------------- |
| `CheckForUpdate()`            | Verifica se há versão mais recente |
| `GetAvailableAppVersions()`   | Lista todas as releases            |
| `InstallAppVersion(tag)`      | Instala versão específica          |
| `DownloadAndApplyUpdate(url)` | Baixa e aplica update              |
| `RestartApp()`                | Reinicia a aplicação               |

**Struct `UpdateInfo`:**

- `available` — Se há update disponível
- `currentVersion` / `latestVersion` — Versões
- `downloadURL` — URL do instalador
- `releaseNotes` — Changelog

---

### 💾 Storage (SQLite)

**Localização:** `internal/storage/`

Persistência de downloads usando SQLite.

| Tabela      | Campos                                                                                |
| ----------- | ------------------------------------------------------------------------------------- |
| `downloads` | id, url, title, status, format, quality, output_path, created_at, completed_at, error |

| Método                   | Descrição                 |
| ------------------------ | ------------------------- |
| `Create(download)`       | Insere novo download      |
| `Update(download)`       | Atualiza status/progresso |
| `GetByID(id)`            | Busca por ID              |
| `GetPending()`           | Downloads pendentes       |
| `GetHistory(limit)`      | Histórico com limite      |
| `Delete(id)` / `Clear()` | Remove registros          |

---

### 📋 Clipboard Monitor

**Localização:** `internal/clipboard/monitor.go`

Monitora a área de transferência em busca de URLs suportadas.

| Funcionalidade      | Descrição                                            |
| ------------------- | ---------------------------------------------------- |
| Detecção automática | Identifica URLs de YouTube, Instagram, Twitter, etc. |
| Eventos             | Emite `clipboard:url` quando URL válida é detectada  |
| Toggle              | Pode ser habilitado/desabilitado pelo usuário        |

---

### 🛡️ System Handler

**Localização:** `internal/handlers/system.go`

Operações de sistema centralizadas.

| Categoria        | Métodos                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| **Dependências** | `CheckDependencies`, `NeedsDependencies`, `DownloadDependencies`                                         |
| **Aria2c**       | `CheckAria2cStatus`, `DownloadAria2c`, `DeleteAria2c`                                                    |
| **Rembg**        | `CheckRembgStatus`, `DownloadRembg`, `DeleteRembg`                                                       |
| **Updater**      | `CheckForUpdate`, `GetAvailableAppVersions`, `InstallAppVersion`, `DownloadAndApplyUpdate`, `RestartApp` |
| **Utilitários**  | `OpenPath`, `GetVersion`                                                                                 |

---

### 🔧 Módulos Auxiliares

| Módulo           | Localização           | Descrição                                                |
| ---------------- | --------------------- | -------------------------------------------------------- |
| **Logger**       | `internal/logger/`    | Logger estruturado com níveis (Debug, Info, Warn, Error) |
| **Rate Limiter** | `internal/ratelimit/` | Controle de taxa para APIs externas                      |
| **Validators**   | `internal/validate/`  | Validação de URLs e dados de entrada                     |
| **Events**       | `internal/events/`    | Wrapper para eventos Wails                               |
| **Errors**       | `internal/errors/`    | Tipos de erro customizados                               |
| **Constants**    | `internal/constants/` | Constantes globais (versões, URLs, etc.)                 |

---

## 🎨 Frontend (React + TypeScript)

Interface moderna construída com Vite, React 18 e Tailwind CSS.

### 📁 Estrutura de Diretórios

```
frontend/src/
├── assets/        # Imagens e recursos estáticos
├── components/    # Componentes reutilizáveis
│   ├── navigation/    # Sidebar, Topbar
│   ├── settings/      # Panels de configuração
│   └── video/         # Componentes de vídeo
├── hooks/         # Custom hooks
├── i18n/          # Internacionalização (5 idiomas)
├── lib/           # Utilitários
├── pages/         # Páginas principais
├── stores/        # Estado global (Zustand-like)
├── test/          # Testes unitários
├── types/         # Definições TypeScript
└── utils/         # Funções utilitárias
```

---

### 📄 Páginas Principais

| Página        | Arquivo         | Descrição                                                                |
| ------------- | --------------- | ------------------------------------------------------------------------ |
| **Home**      | `Home.tsx`      | Tela principal com input de URL, preview de vídeo, fila de downloads     |
| **Dashboard** | `Dashboard.tsx` | Visão geral de estatísticas e atividade recente                          |
| **Converter** | `Converter.tsx` | Interface completa de conversão (vídeo, áudio, imagem, remoção de fundo) |
| **Images**    | `Images.tsx`    | Download e processamento de imagens                                      |
| **Roadmap**   | `Roadmap.tsx`   | Visualização do roadmap público com votação                              |
| **Setup**     | `Setup.tsx`     | Wizard inicial para download de dependências                             |

---

### 🧩 Componentes Principais

#### Layout & Navegação

| Componente    | Descrição                                                             |
| ------------- | --------------------------------------------------------------------- |
| `App.tsx`     | Layout raiz, roteamento, listeners de eventos globais                 |
| `Sidebar.tsx` | Menu lateral com navegação entre páginas                              |
| `Topbar.tsx`  | Barra superior com controles de janela (minimizar, maximizar, fechar) |

#### Downloads

| Componente          | Descrição                                                        |
| ------------------- | ---------------------------------------------------------------- |
| `DownloadModal.tsx` | Modal de configuração de download (formato, qualidade, legendas) |
| `QueueList.tsx`     | Lista de downloads na fila com progresso em tempo real           |
| `Terminal.tsx`      | Console de logs do yt-dlp e processos                            |

#### Feedback & Notificações

| Componente            | Descrição                                                |
| --------------------- | -------------------------------------------------------- |
| `ClipboardToast.tsx`  | Toast de notificação quando URL é detectada no clipboard |
| `DisclaimerModal.tsx` | Modal de aviso legal no primeiro uso                     |
| `SuggestionModal.tsx` | Modal para sugerir novas features (via GitHub)           |

#### Configurações

| Componente               | Descrição                                        |
| ------------------------ | ------------------------------------------------ |
| `SettingsPanel.tsx`      | Painel principal de configurações com tabs       |
| `GeneralSettings.tsx`    | Configurações gerais (idioma, tema, pastas)      |
| `VideoSettings.tsx`      | Opções de download de vídeo (formato, qualidade) |
| `ConverterSettings.tsx`  | Opções de conversão (codec, preset FFmpeg)       |
| `ImageSettings.tsx`      | Opções de imagem (formato, qualidade)            |
| `AppearanceSettings.tsx` | Tema e personalização visual                     |
| `ShortcutSettings.tsx`   | Configuração de atalhos de teclado               |
| `AboutSettings.tsx`      | Informações do app, versão, links úteis          |

---

### 🪝 Custom Hooks

| Hook                      | Descrição                                            |
| ------------------------- | ---------------------------------------------------- |
| `useDownloadActions.ts`   | Abstração para métodos de download do backend        |
| `useDownloadListeners.ts` | Escuta eventos Wails (progresso, conclusão, erros)   |
| `useDownloadSync.ts`      | Sincroniza estado da fila entre UI e backend         |
| `useKeyboardShortcuts.ts` | Gerenciamento de atalhos globais (Ctrl+V, Esc, etc.) |

---

### 📦 Stores (Estado Global)

| Store              | Descrição                               |
| ------------------ | --------------------------------------- |
| `downloadStore.ts` | Estado da fila de downloads e histórico |
| `settingsStore.ts` | Configurações do usuário                |
| `roadmapStore.ts`  | Cache do roadmap e estado de votação    |
| `launcherStore.ts` | Status de dependências                  |

---

### 🌍 Internacionalização (i18n)

**Localização:** `frontend/src/i18n/`

Sistema completo de tradução usando `react-i18next`.

| Idioma                | Código  | Status      |
| --------------------- | ------- | ----------- |
| Português (Brasil)    | `pt-BR` | ✅ Completo |
| English (US)          | `en-US` | ✅ Completo |
| Español (España)      | `es-ES` | ✅ Completo |
| Français (France)     | `fr-FR` | ✅ Completo |
| Deutsch (Deutschland) | `de-DE` | ✅ Completo |

**Namespaces de tradução:**

- `common.json` — Textos gerais
- `settings.json` — Painel de configurações
- `roadmap.json` — Página de roadmap
- `converter.json` — Página de conversão
- `errors.json` — Mensagens de erro

---

### 📐 Tipos & Modelos

| Arquivo                | Descrição                                                                 |
| ---------------------- | ------------------------------------------------------------------------- |
| `wailsjs/go/models.ts` | Tipos TS espelhando structs Go (`VideoInfo`, `DownloadOptions`, `Config`) |
| `src/types/roadmap.ts` | Definições do sistema de Roadmap (`RoadmapItem`, status)                  |

---

## 🛠️ Infraestrutura & CI/CD

### Configuração do Projeto

| Arquivo                       | Descrição                                           |
| ----------------------------- | --------------------------------------------------- |
| `wails.json`                  | Configuração do build Wails (nome, autor, frontend) |
| `go.mod` / `go.sum`           | Dependências Go                                     |
| `frontend/package.json`       | Dependências frontend (Bun)                         |
| `frontend/vite.config.ts`     | Configuração Vite                                   |
| `frontend/tailwind.config.js` | Configuração Tailwind                               |

---

### GitHub Actions

| Workflow         | Arquivo            | Descrição                                      |
| ---------------- | ------------------ | ---------------------------------------------- |
| **CI**           | `ci.yml`           | Build + Testes (Go + Frontend) em cada push/PR |
| **Release**      | `release.yml`      | Build multiplataforma e publicação de releases |
| **Roadmap Sync** | `roadmap-sync.yml` | Sincroniza GitHub Projects → JSON para CDN     |
| **i18n**         | `i18n.yml`         | Validação de arquivos de tradução              |

---

### Pipeline de CI

```
1. Checkout do código
2. Setup Go + Bun
3. Install dependências frontend (bun install)
4. Build frontend (bun run build)
5. Testes Go (go test ./...)
6. Testes frontend (bun run test)
7. Build Wails (wails build)
```

---

### Pipeline de Release

```
1. Trigger: tag semver (v*)
2. Build para Windows, macOS, Linux
3. Assinatura de código (Windows/macOS)
4. Upload de artefatos (.exe, .dmg, .AppImage)
5. Criação de GitHub Release com changelog
```

---

### Roadmap Sync

```
1. Trigger: cron (cada 10 min) ou webhook
2. Fetch dados do GitHub Projects API
3. Tradução de títulos via Gemini AI
4. Geração de roadmap.{lang}.json para cada idioma
5. Deploy para Cloudflare Pages (CDN global)
```

---

## 📚 Documentação

| Arquivo                   | Descrição                        |
| ------------------------- | -------------------------------- |
| `docs/ARCHITECTURE.md`    | Arquitetura detalhada do projeto |
| `docs/FAQ.md`             | Perguntas frequentes             |
| `docs/ROADMAP.md`         | Roadmap de desenvolvimento       |
| `docs/RELEASE.md`         | Processo de release              |
| `docs/TROUBLESHOOTING.md` | Solução de problemas comuns      |
| `docs/LICENSES.md`        | Licenças de dependências         |
| `README.md`               | Documentação principal           |
| `CONTRIBUTING.md`         | Guia de contribuição             |
| `SECURITY.md`             | Política de segurança            |
| `CHANGELOG.md`            | Histórico de mudanças            |

---

## 🔗 Links Úteis

- **Website:** [downkingo.com](https://downkingo.com)
- **GitHub:** [github.com/down-kingo/downkingo](https://github.com/down-kingo/downkingo)
- **Roadmap:** Página "Build in Public" dentro do app

---

_Documentação gerada a partir da análise completa da branch `feat/v2-protected`._  
_Última revisão: Janeiro 2026_
