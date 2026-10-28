# Operação Raiz — Laboratório Linux

Simulador de resposta a incidente em um servidor Linux. Você assume o papel de analista de segurança, investiga um terminal simulado, encontra as flags escondidas e limpa o servidor `srv-web01`.

**[Jogar agora](https://andersonfariaas.github.io/Terminal_Linux/)**

> Tudo roda no navegador. Arquivos, processos, pacotes e logs são fictícios e existem só na memória da página. Nenhum comando sai do navegador nem afeta o seu computador.

## Como jogar

1. Informe seu nome e escolha a cor do terminal. O nome aparece no prompt em minúsculo (ex.: `ana_paula@srv-web01:~$`).
2. Leia o briefing e siga o objetivo atual no painel **Objetivos**, uma etapa por vez.
3. Investigue com comandos Linux. Ao achar uma flag, envie com `submit FLAG{...}`.
4. Travou? Use `hint`. Cada dica custa 20 XP, cobrados uma vez por etapa.

São 10 etapas. Cada uma concluída vale 100 XP, e a progressão vai de **Novato** até **Caçador de Ameaças**. Ao final, o servidor fica "LIMPO" e você recebe um certificado.

Remover pastas críticas pede confirmação com `confirmar <caminho>`, e apagar arquivos importantes custa XP.

## Comandos

| Grupo | Comandos |
|---|---|
| Navegação e leitura | `pwd`, `ls` (`-a`, `-l`), `cd`, `cat`, `less`, `head`, `tail`, `file`, `wc` |
| Busca | `grep` (`-i`, `-n`, `-c`), `find -name` |
| Arquivos | `touch`, `mkdir` (`-p`), `cp`, `mv`, `rm` (`-r`), `rmdir`, `chmod` |
| Processos e sistema | `ps aux`, `top`, `kill`, `whoami`, `id`, `uname -a`, `history`, `date`, `echo` |
| Pacotes (com `sudo`) | `apt update`, `apt install`, `apt remove`, `apt list --installed` |
| Ajuda e jogo | `help`, `man <comando>`, `hint`, `clear`, `submit FLAG{...}`, `confirmar <caminho>` |

**Atalhos:** `Tab` completa comandos e caminhos · `↑` / `↓` navegam pelo histórico · `Ctrl+L` limpa a tela · `Ctrl+C` cancela a linha. No celular, as teclas rápidas aparecem abaixo do terminal.

## Rodar localmente

O projeto não tem build nem dependências. Clone o repositório e sirva a pasta com qualquer servidor estático:

```bash
git clone https://github.com/AndersonFariaas/Terminal_Linux.git
cd Terminal_Linux
python -m http.server 8000
```

Depois, abra <http://localhost:8000>. Também funciona abrir o `index.html` direto no navegador.

## Estrutura

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Telas de cadastro, briefing, boot, certificado e o layout principal |
| `style.css` | Tema, cores do terminal, responsividade e animações |
| `script.js` | Sistema de arquivos simulado, comandos, etapas e progressão |

Para criar uma etapa nova, acrescente um objeto ao array `STAGES` em `script.js`, com `name`, `objective`, `hint`, `flag` e `isComplete`.

## Dados salvos

Perfil e recorde ficam no `localStorage` do navegador, nas chaves `operacao-raiz-perfil` e `operacao-raiz-recorde`. Para começar do zero, apague os dados do site no navegador.

## Tecnologias

HTML, CSS e JavaScript puros, sem framework. A fonte IBM Plex Mono vem do Google Fonts. As animações são desligadas para quem prefere movimento reduzido (`prefers-reduced-motion`).

## Aviso

Projeto didático. Todos os cenários e dados são fictícios.
