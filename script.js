'use strict';

/*
 * Laboratório virtual: arquivos, pacotes, processos e logs vivem só na memória
 * desta página. Nenhum comando sai do navegador nem afeta o computador do usuário.
 */

const HOME = '/home/analista';
const SITE_FILE = '/var/www/index.html';
const UPLOAD_FILE = '/var/www/upload.php';
const WEBSHELL_FILE = '/var/www/assets/.cache';
const PASSWD_FILE = '/etc/passwd';
const CHECKLIST_FILE = `${HOME}/documentos/checklist-contas.txt`;
const MALWARE_BINARY = '/tmp/.x7/keepalive';
const ATTACKER_IP = '185.220.101.17';
const ATTACKER_LOGS = ['/var/log/access.log', '/var/log/auth.log'];
const PROTECTED_PATHS = ['/etc', '/home/analista', '/var/backups', '/var/log', '/var/www'];
const APT_ACTIONS = ['update', 'install', 'remove'];
const AVAILABLE_PACKAGES = ['net-tools', 'htop', 'curl'];
const ESSENTIAL_PACKAGES = ['coreutils', 'grep'];
const UNAME_FULL = 'Linux srv-web01 6.1.0-18-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.76-1 x86_64 GNU/Linux';
const SITE_HTML = '<html><h1>Aurora - portal institucional</h1></html>\n';
const STAGE_XP = 100;
const HINT_COST = 20;
const CONFIRM_PENALTY = 50;
const MAX_HISTORY = 100;
const MAX_OUTPUT_LINES = 400;
const MAX_LOG_LINES = 7;
const CONFETTI_PIECES = 42;
const SPARK_POINTS = 9;
const SPARK_STEP = 12.5;
const RECORD_KEY = 'operacao-raiz-recorde';
const RANKS = [
    { name: 'Novato', xp: 0 },
    { name: 'Aprendiz', xp: 200 },
    { name: 'Analista Jr.', xp: 400 },
    { name: 'Analista Pleno', xp: 650 },
    { name: 'Caçador de Ameaças', xp: 900 },
];
const TIMING = { clock: 1000, metrics: 1800, log: 4000, install: 110, respawn: 5000, toast: 1600, confetti: 2200, finish: 800, matrix: 70, bootLine: 370, bootEnd: 500 };
const BOOT_TAGS = { ok: '[  OK  ]', warn: '[ WARN ]', info: '[ INFO ]' };
const BOOT_LINES = [
    ['info', 'srv-web01 · Debian GNU/Linux 12 (bookworm) · kernel 6.1.0-18-amd64'],
    ['ok', 'Started Journal Service'],
    ['ok', 'Reached target Network'],
    ['ok', 'Started OpenBSD Secure Shell server'],
    ['ok', 'Started A high performance web server (nginx)'],
    ['warn', 'Processo desconhecido detectado em /tmp/.x7'],
    ['ok', 'Started Regular background program processing daemon (cron)'],
    ['info', 'Carregando laboratório Operação Raiz...'],
];
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Sistema de arquivos simulado ---------- */

const createDir = (owner = 'root', mode = 'drwxr-xr-x') => ({ type: 'dir', owner, mode, children: {} });
const createFile = (content = '', owner = 'root', mode = '-rw-r--r--', kind = 'text') => ({ type: 'file', owner, mode, kind, content });

function splitPath(path) {
    return path.split('/').filter(Boolean);
}

function buildFileSystem() {
    const root = createDir();
    const place = (path, node) => {
        const parts = splitPath(path);
        const name = parts.pop();
        const parent = parts.reduce((dir, part) => {
            if (!Object.hasOwn(dir.children, part)) dir.children[part] = createDir();
            return dir.children[part];
        }, root);
        parent.children[name] = node;
    };

    // Diretórios primeiro: os arquivos são colocados dentro deles.
    place('/root', createDir('root', 'drwx------'));
    place('/etc', createDir());
    place('/usr/bin', createDir());
    place('/opt/monitor', createDir());
    place('/var/log', createDir());
    place('/var/www', createDir());
    place('/var/backups', createDir());
    place('/tmp', createDir('root', 'drwxrwxrwt'));
    place('/tmp/.x7', createDir('www-data'));
    place('/home/analista', createDir('analista'));
    place('/home/analista/documentos', createDir('analista'));
    place('/home/analista/.cache', createDir('analista'));

    place('/home/analista/boas-vindas.txt', createFile('Bem-vindo ao srv-web01. O incidente começou às 02:14. Investigue com calma.\n', 'analista'));
    place('/home/analista/.rota-segura', createFile('Primeiro passo concluído. A trilha continua em /var/log.\nCódigo da trilha: FLAG{OLHO_NO_PONTO}\n', 'analista'));
    place('/home/analista/documentos/plantao.txt', createFile('CHECKLIST DO TURNO\n1. Validar arquivos do operador.\n2. Conferir registros de autenticação.\nCódigo do turno: FLAG{PRIMEIRO_PASSO}\n', 'analista'));

    place('/home/analista/documentos/checklist-contas.txt', createFile(
        'CHECKLIST DE CONTAS\n'
        + '1. Somente o root deve ter UID 0 (o terceiro campo de /etc/passwd).\n'
        + '2. Contas de serviço usam /usr/sbin/nologin, nunca um shell.\n'
        + '3. Qualquer conta fora da lista aprovada deve ser reportada.\n'
        + 'Código da checagem: FLAG{CONTA_OCULTA}\n',
        'analista',
    ));

    place('/var/log/auth.log', createFile(
        `Oct 28 02:14:08 srv-web01 sshd[941]: Failed password for invalid user deploy from ${ATTACKER_IP} port 51044 ssh2\n`
        + `Oct 28 02:14:11 srv-web01 sshd[942]: Failed password for invalid user admin from ${ATTACKER_IP} port 51046 ssh2\n`
        + `Oct 28 02:14:15 srv-web01 sshd[943]: Failed password for invalid user test from ${ATTACKER_IP} port 51050 ssh2\n`
        + `Oct 28 02:14:19 srv-web01 sshd[944]: Failed password for root from ${ATTACKER_IP} port 51054 ssh2\n`
        + `Oct 28 02:14:23 srv-web01 sshd[945]: Failed password for invalid user oracle from ${ATTACKER_IP} port 51058 ssh2\n`
        + `Oct 28 02:14:27 srv-web01 sshd[946]: Failed password for invalid user ubuntu from ${ATTACKER_IP} port 51062 ssh2\n`
        + 'Oct 28 02:15:21 srv-web01 sshd[973]: Accepted publickey for www-data from 10.0.0.24 port 42110 ssh2\n'
        + 'Oct 28 02:17:02 srv-web01 sudo[1002]: analista : TTY=pts/0 ; COMMAND=/usr/bin/apt install net-tools\n',
    ));
    place('/var/log/access.log', createFile(
        '10.0.0.24 - - [28/Oct/2026:02:11:04 -0300] "GET / HTTP/1.1" 200 3921\n'
        + `${ATTACKER_IP} - - [28/Oct/2026:02:14:15 -0300] "POST /wp-login.php HTTP/1.1" 401 210\n`
        + `${ATTACKER_IP} - - [28/Oct/2026:02:18:33 -0300] "GET /assets/.cache HTTP/1.1" 200 88\n`,
    ));
    place('/var/log/syslog', createFile(
        'Oct 28 02:18:41 srv-web01 CRON[1110]: (www-data) CMD (/tmp/.x7/keepalive)\n'
        + 'Oct 28 02:19:03 srv-web01 kernel: CPU usage elevated by unknown process\n',
    ));

    place('/var/www/index.html', createFile(SITE_HTML, 'www-data'));
    place('/var/www/deploy.sh', createFile('#!/bin/bash\n# manutenção noturna\n'));
    place('/var/www/upload.php', createFile(
        '<?php\n// upload temporário do portal. Não deveria aceitar escrita de qualquer usuário.\n// Código de auditoria: FLAG{PERMISSAO_FECHADA}\n?>\n',
        'www-data',
        '-rwxrwxrwx',
    ));
    place('/var/www/assets', createDir('www-data'));
    place('/var/www/assets/.cache', createFile(
        "<?php system($_GET['cmd']); ?>\n# porta dos fundos deixada pelo atacante. Código: FLAG{WEBSHELL_ENCONTRADA}\n",
        'www-data',
    ));
    place('/etc/passwd', createFile(
        'root:x:0:0:root:/root:/bin/bash\n'
        + 'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n'
        + 'www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n'
        + 'analista:x:1001:1001:Analista SOC:/home/analista:/bin/bash\n'
        + 'deploy:x:0:0:Deploy automatico:/root:/bin/bash\n',
    ));
    place('/var/backups/web-2026-10-27.tar', createFile('Backup do portal. Conteúdo de exemplo; não remover.\n'));
    place('/var/backups/index.html.bak', createFile(SITE_HTML));

    place('/etc/hostname', createFile('srv-web01\n'));
    place('/etc/os-release', createFile('PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"\n'));
    place('/opt/monitor/check.sh', createFile('#!/bin/sh\necho monitor online\n', 'root', '-rwxr-xr-x'));
    place('/tmp/.x7/keepalive', createFile('#!/bin/sh\n# processo persistente detectado; binário de exemplo\n', 'www-data', '-rwxr-xr-x'));
    place('/tmp/.pulse', createFile('arquivo binário suspeito (conteúdo simulado)\n', 'www-data', '-rwx------', 'binary'));

    return root;
}

/* ---------- Estado do jogo ---------- */

const state = {
    fs: buildFileSystem(),
    cwd: HOME,
    prevCwd: null,
    asRoot: false,
    history: [],
    historyIndex: 0,
    used: new Set(),
    visited: new Set([HOME]),
    read: new Set(),
    listedHidden: false,
    attackerLogs: new Set(),
    packages: new Set(['coreutils', 'grep', 'findutils']),
    installing: new Set(),
    aptUpdated: false,
    processes: [
        { user: 'root', pid: 1, command: '/sbin/init' },
        { user: 'www-data', pid: 842, command: 'nginx: worker process' },
        { user: 'www-data', pid: 1110, command: MALWARE_BINARY, binary: MALWARE_BINARY },
        { user: 'analista', pid: 1441, command: 'bash' },
    ],
    pendingRemoval: null,
    stage: 0,
    score: 0,
    flags: new Set(),
    hintedStages: new Set(),
    siteUp: true,
    contained: false,
    webshellGone: false,
    profile: null,
};

/* ---------- Referências do DOM ---------- */

const $ = (selector) => document.querySelector(selector);
const dom = {
    output: $('#output'),
    terminal: $('#terminal'),
    input: $('#command'),
    prompt: $('#prompt'),
    caption: $('#caption'),
    stagePill: $('#stagePill'),
    serverStatus: $('#serverStatus'),
    cpuValue: $('#cpuValue'),
    ramValue: $('#ramValue'),
    netValue: $('#netValue'),
    cpuLine: $('#cpuLine'),
    ramLine: $('#ramLine'),
    netLine: $('#netLine'),
    rank: $('#rank'),
    score: $('#score'),
    level: $('#levelCount'),
    xpFill: $('#xpFill'),
    objectives: $('#objectives'),
    objectiveCount: $('#objectiveCount'),
    syslog: $('#syslog'),
    matrix: $('#matrix'),
    clock: $('#clock'),
    event: $('#event'),
    toast: $('#toast'),
    confetti: $('#confetti'),
    intro: $('#intro'),
    finish: $('#finish'),
    certificate: $('#certificate'),
    learned: $('#learned'),
    closeFinish: $('#closeFinish'),
    boot: $('#boot'),
    bootLog: $('#bootLog'),
    tabs: [...document.querySelectorAll('[role="tab"]')],
    commandGrid: $('#commandGrid'),
    setup: $('#setup'),
    setupForm: $('#setupForm'),
    setupError: $('#setupError'),
};

/* ---------- Etapas da missão ---------- */

const STAGES = [
    {
        id: 'reconhecimento',
        name: 'Reconhecimento',
        objective: 'Explore sua home e leia o arquivo de plantão em documentos.',
        hint: 'Use pwd e ls para ver onde você está. Entre em documentos (cd documentos) e leia plantao.txt com cat.',
        flag: 'FLAG{PRIMEIRO_PASSO}',
        isComplete: () => state.visited.has(`${HOME}/documentos`) && state.read.has(`${HOME}/documentos/plantao.txt`),
    },
    {
        id: 'arquivos-ocultos',
        name: 'Arquivos ocultos',
        objective: 'Mostre os arquivos ocultos da home e leia .rota-segura.',
        hint: 'Arquivos com nome iniciado por ponto ficam ocultos no ls. Use ls -la e depois cat .rota-segura.',
        flag: 'FLAG{OLHO_NO_PONTO}',
        isComplete: () => state.listedHidden && state.read.has(`${HOME}/.rota-segura`),
    },
    {
        id: 'ferramentas',
        name: 'Ferramentas de análise',
        objective: 'Atualize o índice APT e instale net-tools.',
        hint: 'Atualize o índice com sudo apt update e instale com sudo apt install net-tools.',
        flag: 'FLAG{FERRAMENTA_CERTA}',
        isComplete: () => state.packages.has('net-tools'),
    },
    {
        id: 'tentativas-login',
        name: 'Tentativas de login',
        objective: 'Conte quantas senhas foram recusadas no log de autenticação.',
        hint: 'Leia /var/log/auth.log com grep Failed. Cada linha que aparece é uma tentativa recusada: conte as linhas.',
        flag: 'FLAG{6_TENTATIVAS}',
        isComplete: () => state.read.has('/var/log/auth.log'),
    },
    {
        id: 'contas',
        name: 'Contas suspeitas',
        objective: 'Confira as contas do sistema e o checklist de auditoria.',
        hint: 'Só o root deve ter UID 0 (o terceiro campo de /etc/passwd). Use grep ":0:" /etc/passwd e leia checklist-contas.txt em documentos.',
        flag: 'FLAG{CONTA_OCULTA}',
        isComplete: () => state.read.has(PASSWD_FILE) && state.read.has(CHECKLIST_FILE),
    },
    {
        id: 'permissoes',
        name: 'Permissões',
        objective: 'Leia o upload.php e tire a permissão de escrita dos outros usuários.',
        hint: 'ls -l /var/www mostra as permissões. Em -rwxrwxrwx, os três últimos caracteres valem para outros usuários: use chmod o-w /var/www/upload.php.',
        flag: 'FLAG{PERMISSAO_FECHADA}',
        isComplete: () => state.read.has(UPLOAD_FILE) && !othersCanWrite(UPLOAD_FILE),
    },
    {
        id: 'webshell',
        name: 'Porta dos fundos',
        objective: 'Encontre o arquivo oculto que o atacante deixou no site e leia o conteúdo.',
        hint: 'O access.log mostra GET /assets/.cache. Use find /var/www -name ".cache" e depois cat no arquivo encontrado.',
        flag: 'FLAG{WEBSHELL_ENCONTRADA}',
        isComplete: () => state.read.has(WEBSHELL_FILE),
    },
    {
        id: 'contencao',
        name: 'Contenção',
        objective: 'Encontre a pasta persistente em /tmp e remova-a do servidor.',
        hint: 'O syslog aponta /tmp/.x7/keepalive. Use ls -la /tmp para achar a pasta oculta e rm -r /tmp/.x7. Matar só o processo não basta: o cron o reinicia.',
        flag: 'FLAG{CONTENCAO_FEITA}',
        isComplete: () => isContained(),
    },
    {
        id: 'limpeza',
        name: 'Limpeza do site',
        objective: 'Remova o webshell do site para que o atacante perca a porta de entrada.',
        hint: 'Apague o arquivo com rm /var/www/assets/.cache. Confira antes com ls -la /var/www/assets.',
        flag: 'FLAG{SITE_LIMPO}',
        isComplete: () => !lookup(WEBSHELL_FILE),
    },
    {
        id: 'atribuicao',
        name: 'Atribuição',
        objective: 'Correlacione o IP atacante nos logs e envie a flag final.',
        hint: 'Procure o IP nos dois logs: grep 185.220.101.17 /var/log/access.log /var/log/auth.log.',
        flag: `FLAG{${ATTACKER_IP}}`,
        isComplete: () => ATTACKER_LOGS.every((path) => state.attackerLogs.has(path)) && isContained(),
    },
];

const flagOf = (id) => STAGES.find((stage) => stage.id === id).flag;

const MANUAL = {
    ls: 'ls - lista o conteúdo de um diretório\n-a mostra nomes iniciados por ponto (arquivos ocultos); -l mostra permissões e donos.',
    cd: 'cd - muda o diretório atual\nUse cd <pasta>, cd .., cd ~ ou cd -.',
    pwd: 'pwd - mostra o diretório atual',
    cat: 'cat - mostra o conteúdo de arquivos',
    less: 'less - lê arquivos (nesta versão, funciona como cat)',
    head: 'head - mostra as primeiras linhas\nUso: head [-n N] ARQUIVO (padrão: 10 linhas)',
    tail: 'tail - mostra as últimas linhas\nUso: tail [-n N] ARQUIVO (padrão: 10 linhas)',
    grep: 'grep - mostra as linhas que contêm um texto\nUso: grep [-i] [-n] [-c] PADRÃO ARQUIVO...\n-c mostra só a quantidade de linhas encontradas.',
    find: 'find - procura arquivos na árvore de diretórios\nUso: find CAMINHO -name PADRÃO (aceita * e ?)',
    file: 'file - identifica o tipo de arquivo',
    wc: 'wc - conta linhas (-l), palavras (-w) e bytes (-c)',
    chmod: 'chmod - altera permissões\nExemplos: chmod 755 arquivo; chmod +x arquivo; chmod u-w arquivo.',
    mkdir: 'mkdir - cria diretórios\n-p cria os diretórios pais quando necessário.',
    touch: 'touch - cria um arquivo vazio',
    cp: 'cp - copia arquivos (use -r para diretórios)',
    mv: 'mv - move ou renomeia arquivos',
    rm: 'rm - remove arquivos ou diretórios\n-r remove diretórios recursivamente; -f ignora arquivos inexistentes. Confira o caminho antes de apagar.',
    rmdir: 'rmdir - remove diretórios vazios',
    apt: 'apt - gerenciador de pacotes\nAtualize o índice antes de instalar: sudo apt update; depois sudo apt install <pacote>.',
    sudo: 'sudo - executa um comando com privilégios de administrador. Ex.: sudo apt update',
    ps: 'ps - lista processos (use ps aux para ver todos).',
    top: 'top - mostra um retrato dos processos e da carga do sistema.',
    kill: 'kill - envia sinal de encerramento a um processo.\nCuidado: se o binário ainda existir, o cron reinicia o processo.',
    confirmar: 'confirmar - confirma a remoção de um caminho crítico. Ex.: confirmar /var/www',
    hint: `hint - revela a pista da etapa atual. Custa ${HINT_COST} XP, cobrados uma vez por etapa.`,
    submit: 'submit - envia uma flag encontrada na investigação. Ex.: submit FLAG{...}',
};

/* Cartões do painel "Comandos". Os exemplos não entregam as respostas das etapas. */
const COMMAND_GUIDE = [
    { command: 'pwd', description: 'Mostra em qual pasta você está agora.', example: 'pwd' },
    { command: 'ls', description: 'Lista os arquivos da pasta atual.', example: 'ls' },
    { command: 'ls -la', description: 'Lista também os arquivos ocultos (nomes que começam com ponto).', example: 'ls -la' },
    { command: 'cd', description: 'Entra em uma pasta. Use "cd .." para voltar à pasta de cima.', example: 'cd documentos' },
    { command: 'cat', description: 'Mostra o conteúdo de um arquivo.', example: 'cat boas-vindas.txt' },
    { command: 'grep', description: 'Procura um texto dentro de um arquivo. Muito usado em logs.', example: 'grep Failed /var/log/auth.log' },
    { command: 'tail', description: 'Mostra só as últimas linhas de um arquivo.', example: 'tail -n 5 /var/log/syslog' },
    { command: 'find', description: 'Procura arquivos pelo nome dentro de uma pasta.', example: 'find /etc -name "host*"' },
    { command: 'sudo apt update', description: 'Atualiza a lista de programas disponíveis. Precisa de sudo (permissão de administrador).', example: 'sudo apt update' },
    { command: 'sudo apt install', description: 'Instala um programa da lista.', example: 'sudo apt install htop' },
    { command: 'chmod', description: 'Altera as permissões de um arquivo. "o-w" tira a escrita dos outros usuários.', example: 'chmod o-w arquivo.txt' },
    { command: 'ps aux', description: 'Lista os processos (programas) rodando agora.', example: 'ps aux' },
    { command: 'kill', description: 'Encerra um processo pelo número PID. Alguns processos voltam sozinhos.', example: 'kill 1234' },
    { command: 'rm -r', description: 'Apaga uma pasta e tudo que está dentro dela. Confira o caminho antes!', example: 'rm -r pasta-de-teste' },
    { command: 'man', description: 'Explica um comando. Use man seguido do nome do comando.', example: 'man ls' },
    { command: 'hint', description: `Mostra a pista da etapa atual. Custa ${HINT_COST} XP, uma vez por etapa.`, example: 'hint' },
    { command: 'submit', description: 'Envia a flag que você encontrou na investigação.', example: 'submit FLAG{...}' },
];

/* ---------- Utilidades de caminho ---------- */

function lookup(path) {
    return splitPath(path).reduce((node, part) => {
        if (!node || node.type !== 'dir' || !Object.hasOwn(node.children, part)) return null;
        return node.children[part];
    }, state.fs);
}

function absolutePath(input = '.') {
    const expanded = input === '~' || input.startsWith('~/') ? HOME + input.slice(1) : input;
    const base = expanded.startsWith('/') ? '' : state.cwd;
    const parts = [];
    for (const segment of `${base}/${expanded}`.split('/')) {
        if (segment === '..') parts.pop();
        else if (segment && segment !== '.') parts.push(segment);
    }
    return `/${parts.join('/')}`;
}

function parentOf(path) {
    const parts = splitPath(path);
    const name = parts.pop();
    return { parent: lookup(`/${parts.join('/')}`), name };
}

const baseName = (path) => splitPath(path).pop();
const joinPath = (dir, name) => `${dir.replace(/\/$/, '')}/${name}`;
const isContained = () => lookup(MALWARE_BINARY) === null;
const othersCanWrite = (path) => lookup(path)?.mode[8] === 'w';
const isProtected = (path) => PROTECTED_PATHS.some((item) => item === path || item.startsWith(`${path}/`));

function displayCwd() {
    if (state.cwd === HOME) return '~';
    return state.cwd.startsWith(`${HOME}/`) ? `~${state.cwd.slice(HOME.length)}` : state.cwd;
}

const promptText = () => `analista@srv-web01:${displayCwd()}$`;

/* ---------- Saída do terminal ---------- */

function scrollToBottom() {
    dom.terminal.scrollTop = dom.terminal.scrollHeight;
}

function print(text = '', tone = '') {
    const line = document.createElement('div');
    line.className = tone ? `out ${tone}` : 'out';
    line.textContent = text;
    dom.output.append(line);
    while (dom.output.children.length > MAX_OUTPUT_LINES) dom.output.firstElementChild.remove();
    scrollToBottom();
    return line;
}

const fail = (text) => print(text, 'error');

function clearOutput() {
    dom.output.replaceChildren();
}

/* ---------- Interpretação de comandos ---------- */

function tokenize(line) {
    const tokens = line.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
    return tokens.map((token) => token.replace(/^(["'])(.*)\1$/, '$2'));
}

function parseArgs(args) {
    const flags = new Set();
    const operands = [];
    for (const arg of args) {
        if (arg.startsWith('-') && arg.length > 1) [...arg.slice(1)].forEach((flag) => flags.add(flag));
        else operands.push(arg);
    }
    return { flags, operands };
}

function execute(name, args) {
    if (!Object.hasOwn(COMMANDS, name)) return fail(`bash: ${name}: command not found`);
    state.used.add(name);
    COMMANDS[name](args);
}

function run(rawLine) {
    const line = rawLine.trim();
    if (!line) return;
    rememberCommand(line);
    print(`${promptText()} ${line}`, 'dim');
    const [name, ...args] = tokenize(line);
    try {
        execute(name, args);
    } catch (error) {
        console.error(error);
        fail(`bash: erro interno ao executar "${name}". Veja o console do navegador.`);
    }
    render();
}

function rememberCommand(line) {
    state.history.push(line);
    if (state.history.length > MAX_HISTORY) state.history.shift();
    state.historyIndex = state.history.length;
}

/* ---------- Comandos ---------- */

function cmdHelp() {
    print('Comandos: pwd ls cd cat less head tail touch mkdir cp mv rm rmdir grep find file wc chmod', 'good');
    print('          sudo apt update|install|remove|list · ps aux · top · kill · whoami · id · uname -a', 'good');
    print('          history man hint clear echo date submit FLAG{...}', 'good');
    print('Use man <comando> para explicações. Tab completa comandos e caminhos. O ambiente é totalmente simulado.');
}

function formatLong(name, node) {
    const size = node.type === 'dir' ? 4096 : node.content.length;
    return `${node.mode} 1 ${node.owner} ${node.owner} ${size} Oct 28 02:14 ${name}`;
}

function cmdLs(args) {
    const { flags, operands } = parseArgs(args);
    const target = operands[0] ?? '.';
    const path = absolutePath(target);
    const node = lookup(path);
    if (!node) return fail(`ls: cannot access '${target}': No such file or directory`);
    if (node.type === 'file') return print(flags.has('l') ? formatLong(target, node) : target);

    const showHidden = flags.has('a');
    const entries = Object.entries(node.children)
        .filter(([name]) => showHidden || !name.startsWith('.'))
        .sort(([a], [b]) => a.localeCompare(b));
    if (showHidden) {
        entries.unshift(['.', node], ['..', lookup(absolutePath(`${path}/..`))]);
        if (Object.keys(node.children).some((name) => name.startsWith('.'))) state.listedHidden = true;
    }

    if (flags.has('l')) {
        print(`total ${entries.length}`);
        entries.forEach(([name, child]) => print(formatLong(name, child)));
    } else {
        print(entries.map(([name]) => name).join('  '));
    }
}

function cmdCd(args) {
    const requested = args[0] ?? '~';
    const destination = requested === '-' ? (state.prevCwd ?? state.cwd) : requested;
    if (requested === '-') print(destination, 'dim');

    const path = absolutePath(destination);
    const node = lookup(path);
    if (!node) return fail(`bash: cd: ${destination}: No such file or directory`);
    if (node.type !== 'dir') return fail(`bash: cd: ${destination}: Not a directory`);
    if (path === '/root') return fail('bash: cd: /root: Permission denied');

    state.prevCwd = state.cwd;
    state.cwd = path;
    state.visited.add(path);
}

function selectLines(content, command, count) {
    const text = content.replace(/\n$/, '');
    if (command === 'head') return text.split('\n').slice(0, count).join('\n');
    if (command === 'tail') return text.split('\n').slice(-count).join('\n');
    return text;
}

function readFiles(command, args) {
    const countIndex = args.indexOf('-n');
    const count = countIndex === -1 ? 10 : Number(args[countIndex + 1]) || 10;
    const operands = countIndex === -1 ? args : args.filter((_, index) => index !== countIndex && index !== countIndex + 1);
    if (!operands.length) return fail(`${command}: missing file operand`);

    for (const operand of operands) {
        const path = absolutePath(operand);
        const node = lookup(path);
        if (!node) {
            fail(`${command}: ${operand}: No such file or directory`);
        } else if (node.type === 'dir') {
            fail(`${command}: ${operand}: Is a directory`);
        } else {
            state.read.add(path);
            print(selectLines(node.content, command, count));
        }
    }
}

function cmdMkdir(args) {
    const { flags, operands } = parseArgs(args);
    if (!operands.length) return fail('mkdir: missing operand');

    for (const operand of operands) {
        const path = absolutePath(operand);
        if (lookup(path)) {
            if (!flags.has('p')) fail(`mkdir: cannot create directory '${operand}': File exists`);
        } else if (flags.has('p')) {
            createDirectories(path, operand);
        } else {
            const { parent, name } = parentOf(path);
            if (parent?.type === 'dir') parent.children[name] = createDir('analista');
            else fail(`mkdir: cannot create directory '${operand}': No such file or directory`);
        }
    }
}

function createDirectories(path, operand) {
    let dir = state.fs;
    for (const part of splitPath(path)) {
        if (!Object.hasOwn(dir.children, part)) dir.children[part] = createDir('analista');
        dir = dir.children[part];
        if (dir.type !== 'dir') return fail(`mkdir: cannot create directory '${operand}': Not a directory`);
    }
}

function cmdTouch(args) {
    if (!args.length) return fail('touch: missing file operand');
    for (const operand of args) {
        const path = absolutePath(operand);
        if (lookup(path)) continue;
        const { parent, name } = parentOf(path);
        if (parent?.type === 'dir') parent.children[name] = createFile('', 'analista');
        else fail(`touch: cannot touch '${operand}': No such file or directory`);
    }
}

function cmdCopyMove(command, args) {
    const { flags, operands } = parseArgs(args);
    if (operands.length < 2) return fail(`${command}: missing file operand`);

    const [sourceOperand, destinationOperand] = operands;
    const sourcePath = absolutePath(sourceOperand);
    const source = lookup(sourcePath);
    if (sourcePath === '/') return fail(`${command}: refusing to operate on '/'`);
    if (!source) return fail(`${command}: cannot stat '${sourceOperand}': No such file or directory`);
    if (command === 'cp' && source.type === 'dir' && !flags.has('r')) {
        return fail(`cp: -r not specified; omitting directory '${sourceOperand}'`);
    }

    const destinationPath = absolutePath(destinationOperand);
    const destinationNode = lookup(destinationPath);
    const targetPath = destinationNode?.type === 'dir' ? joinPath(destinationPath, baseName(sourcePath)) : destinationPath;
    if (targetPath === sourcePath) return fail(`${command}: '${sourceOperand}' and '${destinationOperand}' are the same file`);
    if (targetPath.startsWith(`${sourcePath}/`)) return fail(`${command}: cannot move '${sourceOperand}' into itself`);

    const { parent, name } = parentOf(targetPath);
    if (parent?.type !== 'dir') return fail(`${command}: cannot create '${destinationOperand}': No such file or directory`);

    parent.children[name] = structuredClone(source);
    if (command === 'mv') {
        const origin = parentOf(sourcePath);
        delete origin.parent.children[origin.name];
    }
}

function cmdRemove(command, args) {
    const { flags, operands } = parseArgs(args);
    if (!operands.length) return fail(`${command}: missing operand`);

    for (const operand of operands) {
        const path = absolutePath(operand);
        const node = lookup(path);
        if (!node) {
            if (!flags.has('f')) fail(`${command}: cannot remove '${operand}': No such file or directory`);
        } else if (path === '/') {
            const recursive = flags.has('r') || flags.has('R');
            fail(recursive ? `${command}: it is dangerous to operate recursively on '/'` : `${command}: cannot remove '/': Is a directory`);
        } else if (command === 'rmdir' && node.type !== 'dir') {
            fail(`rmdir: failed to remove '${operand}': Not a directory`);
        } else if (command === 'rmdir' && Object.keys(node.children ?? {}).length > 0) {
            fail(`rmdir: failed to remove '${operand}': Directory not empty`);
        } else if (command === 'rm' && node.type === 'dir' && !flags.has('r') && !flags.has('R')) {
            fail(`rm: cannot remove '${operand}': Is a directory`);
        } else if (isProtected(path)) {
            requestConfirmation(path);
        } else {
            const { parent, name } = parentOf(path);
            delete parent.children[name];
        }
    }
}

function requestConfirmation(path) {
    state.pendingRemoval = path;
    print(`⚠ ${path} contém arquivos críticos. Para confirmar, digite: confirmar ${path}`, 'warn');
}

function cmdConfirm(args) {
    const target = args[0] ? absolutePath(args[0]) : null;
    if (!state.pendingRemoval || target !== state.pendingRemoval || !lookup(target)) {
        return fail('Nenhuma remoção pendente para esse caminho.');
    }
    const { parent, name } = parentOf(target);
    delete parent.children[name];
    state.pendingRemoval = null;
    state.score = Math.max(0, state.score - CONFIRM_PENALTY);
    print(`Removido: ${target}. −${CONFIRM_PENALTY} XP por destruir dados críticos.`, 'warn');
}

function cmdGrep(args) {
    const { flags, operands } = parseArgs(args);
    const [pattern, ...files] = operands;
    if (!pattern || !files.length) return fail('Usage: grep [-i] [-n] [-c] PATTERNS [FILE]...');

    const ignoreCase = flags.has('i');
    const needle = ignoreCase ? pattern.toLowerCase() : pattern;
    const showFileName = files.length > 1;
    for (const file of files) {
        const path = absolutePath(file);
        const node = lookup(path);
        if (!node) {
            fail(`grep: ${file}: No such file or directory`);
            continue;
        }
        if (node.type === 'dir') {
            fail(`grep: ${file}: Is a directory`);
            continue;
        }

        state.read.add(path);
        const matches = node.content.split('\n')
            .map((line, index) => ({ line, number: index + 1 }))
            .filter(({ line }) => (ignoreCase ? line.toLowerCase() : line).includes(needle));
        const fileLabel = showFileName ? `${file}:` : '';
        if (flags.has('c')) {
            print(`${fileLabel}${matches.length}`);
        } else {
            matches.forEach(({ line, number }) => print(`${fileLabel}${flags.has('n') ? `${number}:` : ''}${line}`));
        }
        if (pattern === ATTACKER_IP && matches.length > 0) state.attackerLogs.add(path);
    }
}

function globToRegExp(glob) {
    const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
    return new RegExp(`^${escaped}$`);
}

function cmdFind(args) {
    let start = '.';
    let pattern = null;
    for (let index = 0; index < args.length; index++) {
        if (args[index] === '-name') pattern = globToRegExp(args[++index] ?? '*');
        else if (!args[index].startsWith('-')) start = args[index];
    }

    const root = lookup(absolutePath(start));
    if (!root) return fail(`find: '${start}': No such file or directory`);

    const walk = (node, displayPath) => {
        if (!pattern || pattern.test(baseName(displayPath))) print(displayPath);
        if (node.type !== 'dir') return;
        Object.keys(node.children).sort().forEach((name) => walk(node.children[name], joinPath(displayPath, name)));
    };
    walk(root, start);
}

function describeFile(node) {
    if (node.type === 'dir') return 'directory';
    if (node.kind === 'binary') return 'data';
    if (!node.content) return 'empty';
    return node.content.startsWith('#!') ? 'POSIX shell script, ASCII text executable' : 'ASCII text';
}

function cmdFile(args) {
    if (!args.length) return fail('Usage: file [FILE]...');
    for (const operand of args) {
        const node = lookup(absolutePath(operand));
        if (node) print(`${operand}: ${describeFile(node)}`);
        else fail(`cannot open '${operand}' (No such file or directory)`);
    }
}

function cmdWc(args) {
    const { flags, operands } = parseArgs(args);
    if (!operands.length) return fail('wc: missing file operand');
    const showAll = flags.size === 0;

    for (const operand of operands) {
        const node = lookup(absolutePath(operand));
        if (node?.type !== 'file') {
            fail(`wc: ${operand}: No such file or directory`);
            continue;
        }
        const text = node.content;
        const counts = [];
        if (showAll || flags.has('l')) counts.push(text.split('\n').length - 1);
        if (showAll || flags.has('w')) counts.push(text.trim() ? text.trim().split(/\s+/).length : 0);
        if (showAll || flags.has('c')) counts.push(new TextEncoder().encode(text).length);
        print(`${counts.join(' ')} ${operand}`);
    }
}

const RWX = 'rwx';
const GROUP_OFFSET = { u: 0, g: 3, o: 6 };

function applyMode(node, spec) {
    const kind = node.type === 'dir' ? 'd' : '-';
    if (/^[0-7]{3}$/.test(spec)) {
        const octalToRwx = (digit) => [...RWX].map((letter, bit) => ((Number(digit) & (4 >> bit)) ? letter : '-')).join('');
        return kind + [...spec].map(octalToRwx).join('');
    }

    const match = spec.match(/^([ugoa]*)([+=-])([rwx]+)$/);
    if (!match) return null;
    const [, who, operator, rights] = match;
    const groups = (who || 'a').includes('a') ? Object.keys(GROUP_OFFSET) : [...who];
    const perms = node.mode.slice(1).split('');

    for (const group of groups) {
        [...RWX].forEach((letter, bit) => {
            const index = GROUP_OFFSET[group] + bit;
            const granted = rights.includes(letter);
            if (operator === '=') perms[index] = granted ? letter : '-';
            else if (granted) perms[index] = operator === '+' ? letter : '-';
        });
    }
    return kind + perms.join('');
}

function cmdChmod(args) {
    const [spec, ...operands] = args;
    if (!spec || !operands.length) return fail('chmod: missing operand');

    for (const operand of operands) {
        const node = lookup(absolutePath(operand));
        if (!node) {
            fail(`chmod: cannot access '${operand}': No such file or directory`);
            continue;
        }
        const mode = applyMode(node, spec);
        if (!mode) return fail(`chmod: modo inválido: '${spec}'`);
        node.mode = mode;
    }
}

function cmdApt(args) {
    const [action, packageName] = args;
    if (action === 'list' && packageName === '--installed') return listInstalledPackages();
    if (!APT_ACTIONS.includes(action)) return fail(`apt: comando ou opção desconhecida: ${action ?? ''}`.trimEnd());
    if (!state.asRoot) return fail('E: Não foi possível bloquear o diretório de pacotes. Execute com sudo.');
    if (action === 'update') return updatePackageIndex();
    if (action === 'install') return installPackage(packageName);
    return removePackage(packageName);
}

function updatePackageIndex() {
    print('Atingindo:1 http://deb.debian.org/debian bookworm InRelease');
    print('Lendo listas de pacotes... Pronto');
    state.aptUpdated = true;
}

function installPackage(packageName) {
    if (!packageName) return fail('E: Operação install requer ao menos um pacote');
    if (!state.aptUpdated) return fail('E: Você precisa executar «apt update» primeiro.');
    if (!AVAILABLE_PACKAGES.includes(packageName)) return fail(`E: Não foi possível localizar o pacote ${packageName}`);
    if (state.packages.has(packageName)) return print(`${packageName} já está na versão mais recente (1.0-1).`);
    if (state.installing.has(packageName)) return fail(`E: ${packageName} já está sendo instalado.`);

    print('Lendo listas de pacotes... Pronto');
    print('Construindo árvore de dependências... Pronto');
    print(`Os seguintes NOVOS pacotes serão instalados: ${packageName}`);
    const progress = print('', 'good');
    state.installing.add(packageName);

    let percent = 0;
    const timer = setInterval(() => {
        percent += 20;
        progress.textContent = `Configurando ${packageName}: [${'='.repeat(percent / 2)}${' '.repeat(50 - percent / 2)}] ${percent}%`;
        scrollToBottom();
        if (percent < 100) return;

        clearInterval(timer);
        state.installing.delete(packageName);
        state.packages.add(packageName);
        print(`Configurando ${packageName} (1.0-1) ...\nProcessamento de gatilhos para man-db ...`, 'good');
        if (packageName === 'net-tools') print(`Registro de auditoria: ${flagOf('ferramentas')}`, 'good');
        render();
    }, TIMING.install);
}

function removePackage(packageName) {
    if (!packageName) return fail('E: Operação remove requer ao menos um pacote');
    if (!state.packages.has(packageName)) return fail(`E: O pacote ${packageName} não está instalado`);
    if (ESSENTIAL_PACKAGES.includes(packageName)) return fail(`E: Não é possível remover pacote essencial ${packageName}`);
    state.packages.delete(packageName);
    print(`Removendo ${packageName} ...`, 'good');
}

function listInstalledPackages() {
    print('Listando... Pronto');
    [...state.packages].sort().forEach((pkg) => print(`${pkg}/bookworm,now 1.0 amd64 [installed]`));
}

function runAsRoot(args) {
    if (!args.length) return fail('uso: sudo <comando> [argumentos]');
    const [name, ...rest] = args;
    state.asRoot = true;
    try {
        execute(name, rest);
    } finally {
        state.asRoot = false;
    }
}

function cmdPs(args) {
    if (!args.length) return print('  PID TTY          TIME CMD\n 1441 pts/0    00:00:00 bash');
    if (args[0] !== 'aux') return fail(`ps: opção inválida: ${args[0]}`);
    print('USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND');
    state.processes.forEach((proc) => print(`${proc.user.padEnd(10)} ${String(proc.pid).padEnd(5)}  0.1  1.2  12400  2100 ?        Ss   02:14   0:01 ${proc.command}`));
}

function cmdTop() {
    print(`top - ${new Date().toLocaleTimeString('pt-BR')} up 2 days,  4:31,  2 users,  load average: 0.84, 0.79, 0.71`);
    print(`Tasks: ${state.processes.length} total,   1 running, ${state.processes.length - 1} sleeping,   0 stopped,   0 zombie`);
    state.processes.forEach((proc) => print(`${String(proc.pid).padEnd(6)} ${proc.user.padEnd(10)}  0.5  ${proc.command}`));
}

function cmdKill(args) {
    const pid = Number(args.at(-1));
    if (!Number.isInteger(pid) || pid < 1) return fail('kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...');
    if (pid === 1) return fail('kill: (1) - Operation not permitted');

    const proc = state.processes.find((item) => item.pid === pid);
    if (!proc) return fail(`bash: kill: (${pid}) - No such process`);

    state.processes = state.processes.filter((item) => item !== proc);
    print(`Processo ${pid} encerrado: ${proc.command}`, 'good');
    if (proc.binary && !isContained()) scheduleRespawn(proc);
}

function scheduleRespawn(proc) {
    setTimeout(() => {
        if (isContained()) return;
        state.processes.push(proc);
        print(`cron[${proc.pid}]: (${proc.user}) CMD (${proc.command}) reiniciado: o binário ainda existe.`, 'error');
        render();
    }, TIMING.respawn);
}

function cmdHistory() {
    state.history.forEach((line, index) => print(`${String(index + 1).padStart(5)}  ${line}`));
}

function cmdMan(args) {
    const topic = args[0];
    if (!topic) return fail('What manual page do you want?');
    const entry = MANUAL[topic];
    if (!entry) return fail(`No manual entry for ${topic}`);
    print(entry, 'good');
}

function currentStage() {
    return STAGES[state.stage] ?? null;
}

function cmdHint() {
    const stage = currentStage();
    if (!stage) return print('Nenhuma dica pendente.');
    if (state.hintedStages.has(state.stage)) return print(`DICA: ${stage.hint}`, 'warn');

    state.hintedStages.add(state.stage);
    state.score = Math.max(0, state.score - HINT_COST);
    print(`DICA (−${HINT_COST} XP, cobrado uma vez nesta etapa): ${stage.hint}`, 'warn');
}

function cmdSubmit(args) {
    const stage = currentStage();
    if (!stage) return print('Todas as flags foram capturadas. Missão concluída!', 'good');

    const [flag] = args;
    if (state.flags.has(flag)) return print('Essa flag já foi capturada. Veja o objetivo da etapa atual.', 'warn');
    if (flag !== stage.flag) return fail('Flag incorreta. Continue investigando.');
    if (!stage.isComplete()) return fail('Flag correta, mas esta etapa ainda não foi concluída. Releia o objetivo.');

    const previousRank = rankIndex(state.score);
    state.flags.add(flag);
    state.score += STAGE_XP;
    state.stage += 1;
    print(`Flag validada: ${flag}`, 'good');
    celebrate();
    if (rankIndex(state.score) > previousRank) announceLevelUp();

    if (state.stage === STAGES.length) setTimeout(showFinish, TIMING.finish);
    else print(`Próxima etapa: ${STAGES[state.stage].name}. Use hint se precisar de ajuda.`);
}

const COMMANDS = {
    help: cmdHelp,
    pwd: () => print(state.cwd),
    ls: cmdLs,
    cd: cmdCd,
    cat: (args) => readFiles('cat', args),
    less: (args) => readFiles('less', args),
    head: (args) => readFiles('head', args),
    tail: (args) => readFiles('tail', args),
    mkdir: cmdMkdir,
    touch: cmdTouch,
    cp: (args) => cmdCopyMove('cp', args),
    mv: (args) => cmdCopyMove('mv', args),
    rm: (args) => cmdRemove('rm', args),
    rmdir: (args) => cmdRemove('rmdir', args),
    confirmar: cmdConfirm,
    grep: cmdGrep,
    find: cmdFind,
    file: cmdFile,
    wc: cmdWc,
    chmod: cmdChmod,
    sudo: runAsRoot,
    apt: cmdApt,
    ps: cmdPs,
    top: cmdTop,
    kill: cmdKill,
    whoami: () => print('analista'),
    id: () => print('uid=1001(analista) gid=1001(analista) groups=1001(analista),27(sudo)'),
    uname: (args) => print(args[0] === '-a' ? UNAME_FULL : 'Linux'),
    history: cmdHistory,
    man: cmdMan,
    hint: cmdHint,
    clear: clearOutput,
    cls: clearOutput,
    echo: (args) => print(args.join(' ')),
    date: () => print(new Date().toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'long' })),
    submit: cmdSubmit,
};

/* ---------- Autocompletar (Tab) ---------- */

const option = (text, label = text, isDir = false) => ({ text, label, isDir });
const matching = (names, word) => names.filter((name) => name.startsWith(word)).sort().map((name) => option(name));

function pathOptions(word) {
    const slash = word.lastIndexOf('/');
    const dirPart = word.slice(0, slash + 1);
    const stem = word.slice(slash + 1);
    const dir = lookup(absolutePath(dirPart || '.'));
    if (dir?.type !== 'dir') return [];

    return Object.keys(dir.children)
        .filter((name) => name.startsWith(stem) && (!name.startsWith('.') || stem.startsWith('.')))
        .sort()
        .map((name) => option(dirPart + name, name, dir.children[name].type === 'dir'));
}

function completionOptions(words, word) {
    const [command, subcommand] = words;
    if (!command) return matching(Object.keys(COMMANDS), word);
    if (command === 'apt' && words.length === 1) return matching([...APT_ACTIONS, 'list'], word);
    if (command === 'apt' && subcommand === 'install') return matching(AVAILABLE_PACKAGES, word);
    if (command === 'apt' && subcommand === 'remove') return matching([...state.packages], word);
    if (command === 'ps' && words.length === 1) return matching(['aux'], word);
    return pathOptions(word);
}

function commonPrefix(strings) {
    return strings.reduce((prefix, text) => {
        let index = 0;
        while (index < prefix.length && prefix[index] === text[index]) index++;
        return prefix.slice(0, index);
    });
}

/*
 * Só substitui a palavra que está sendo digitada. O texto antes dela
 * (ex.: "cat ") é preservado.
 */
function completeInput() {
    const [, before, word] = dom.input.value.match(/^(.*?)(\S*)$/);
    const words = before.trim().split(/\s+/).filter(Boolean);
    const commandWords = words[0] === 'sudo' ? words.slice(1) : words;
    const options = completionOptions(commandWords, word);
    if (options.length === 0) return;

    if (options.length === 1) {
        const [only] = options;
        dom.input.value = `${before}${only.text}${only.isDir ? '/' : ' '}`;
        return;
    }

    const shared = commonPrefix(options.map((item) => item.text));
    if (shared.length > word.length) {
        dom.input.value = before + shared;
        return;
    }
    print(options.map((item) => item.label + (item.isDir ? '/' : '')).join('  '), 'dim');
}

/* ---------- Entrada do usuário ---------- */

function recallHistory(delta) {
    const { history } = state;
    state.historyIndex = Math.min(history.length, Math.max(0, state.historyIndex + delta));
    dom.input.value = history[state.historyIndex] ?? '';
}

function cancelLine() {
    print(`${promptText()} ${dom.input.value}^C`, 'dim');
    dom.input.value = '';
    state.historyIndex = state.history.length;
}

function submitLine() {
    const line = dom.input.value;
    dom.input.value = '';
    run(line);
}

function handleKey(key) {
    switch (key) {
        case 'Tab': completeInput(); break;
        case 'ArrowUp': recallHistory(-1); break;
        case 'ArrowDown': recallHistory(1); break;
        case 'Clear': clearOutput(); break;
    }
}

function onInputKeydown(event) {
    if (event.isComposing) return;
    const key = event.key.toLowerCase();
    if (event.ctrlKey && key === 'l') {
        event.preventDefault();
        clearOutput();
    } else if (event.ctrlKey && key === 'c' && dom.input.selectionStart === dom.input.selectionEnd) {
        event.preventDefault();
        cancelLine();
    } else if (['Tab', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        handleKey(event.key);
    }
}

/* ---------- Estado visível (painéis) ---------- */

/*
 * Roda depois de cada comando: detecta mudanças no mundo simulado
 * (site fora do ar, malware contido, diretório atual removido) e avisa o usuário.
 */
function syncWorld() {
    if (!lookup(state.cwd)) {
        state.cwd = '/';
        print('bash: aviso: o diretório atual foi removido. Você está em /.', 'warn');
    }

    const siteUp = lookup(SITE_FILE) !== null;
    if (siteUp !== state.siteUp) {
        state.siteUp = siteUp;
        if (siteUp) print('nginx: portal restaurado e respondendo novamente.', 'good');
        else print('nginx: portal indisponível. Serviço web fora do ar.', 'error');
    }

    const contained = isContained();
    if (contained && !state.contained) {
        state.processes = state.processes.filter((proc) => !proc.binary);
        print(`Malware removido. Atividade de CPU voltando ao normal. Código de contenção: ${flagOf('contencao')}`, 'good');
    }
    state.contained = contained;

    const webshellGone = !lookup(WEBSHELL_FILE);
    if (webshellGone && !state.webshellGone) {
        print(`Webshell removido do site. Código de remediação: ${flagOf('limpeza')}`, 'good');
    }
    state.webshellGone = webshellGone;
}

function describeServer() {
    if (!state.siteUp) return { text: 'SERVIÇO FORA', tone: 'danger' };
    if (!state.contained) {
        return state.stage === 0
            ? { text: 'COMPROMETIDO', tone: 'danger' }
            : { text: 'SUSPEITO', tone: 'suspicious' };
    }
    if (state.stage < STAGES.length) return { text: 'SOB OBSERVAÇÃO', tone: 'suspicious' };
    return { text: 'LIMPO', tone: '' };
}

function rankIndex(score) {
    return RANKS.reduce((index, rank, rankPosition) => (score >= rank.xp ? rankPosition : index), 0);
}

function renderScore() {
    const index = rankIndex(state.score);
    const rank = RANKS[index];
    const next = RANKS[index + 1];
    const progress = next ? (state.score - rank.xp) / (next.xp - rank.xp) : 1;

    dom.rank.textContent = rank.name;
    dom.score.textContent = `${state.score} XP`;
    dom.level.textContent = `Nível ${index + 1}`;
    dom.xpFill.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
    const total = String(STAGES.length).padStart(2, '0');
    dom.stagePill.textContent = `● EXERCÍCIO ${String(Math.min(state.stage + 1, STAGES.length)).padStart(2, '0')} / ${total}`;
}

function renderStatus() {
    const { text, tone } = describeServer();
    dom.serverStatus.className = tone ? `status ${tone}` : 'status';
    dom.serverStatus.textContent = text;
}

function renderObjectives() {
    dom.objectives.replaceChildren(...STAGES.map((stage, index) => {
        const done = index < state.stage;
        const row = document.createElement('div');
        row.className = `objective${done ? ' done' : ''}${index === state.stage ? ' current' : ''}`;

        const check = document.createElement('span');
        check.className = 'check';
        check.textContent = done ? '✓' : '';

        const text = document.createElement('span');
        const title = document.createElement('b');
        title.textContent = `Nível ${index + 1} · ${stage.name}`;
        text.append(title, document.createElement('br'), stage.objective);

        row.append(check, text);
        return row;
    }));
    dom.objectiveCount.textContent = `${state.stage}/${STAGES.length}`;
}

function saveRecord() {
    try {
        const saved = JSON.parse(localStorage.getItem(RECORD_KEY) ?? '{}');
        if (state.score <= (saved.score ?? 0)) return;
        localStorage.setItem(RECORD_KEY, JSON.stringify({ score: state.score, flags: [...state.flags], date: new Date().toISOString() }));
    } catch (error) {
        console.warn('Não foi possível salvar o recorde neste navegador.', error);
    }
}

function render() {
    syncWorld();
    dom.prompt.textContent = promptText();
    dom.caption.textContent = `analista@srv-web01: ${displayCwd()}`;
    renderStatus();
    renderScore();
    renderObjectives();
    saveRecord();
}

/* ---------- Efeitos de conquista ---------- */

function launchConfetti() {
    if (REDUCED_MOTION) return;
    for (let index = 0; index < CONFETTI_PIECES; index++) {
        const piece = document.createElement('i');
        piece.className = 'pixel';
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.top = `${-10 - Math.random() * 20}px`;
        piece.style.animationDelay = `${Math.random() * 0.5}s`;
        dom.confetti.append(piece);
        setTimeout(() => piece.remove(), TIMING.confetti);
    }
}

function celebrate() {
    dom.toast.classList.add('show');
    setTimeout(() => dom.toast.classList.remove('show'), TIMING.toast);
    launchConfetti();
}

function announceLevelUp() {
    dom.event.classList.remove('flash');
    void dom.event.offsetWidth;
    dom.event.classList.add('flash');
}

function showFinish() {
    const { nome } = state.profile;
    dom.certificate.textContent = `CERTIFICAMOS que ${nome} concluiu a Operação Raiz em ${new Date().toLocaleString('pt-BR')}, capturou ${state.flags.size}/${STAGES.length} flags e encerrou com ${state.score} XP. Servidor srv-web01: LIMPO.`;
    dom.learned.textContent = `Comandos praticados: ${[...state.used].join(', ')}. Pontuação salva neste navegador.`;
    dom.finish.classList.remove('hidden');
    dom.closeFinish.focus();
}

/* ---------- Painéis animados (dados simulados) ---------- */

const randomBetween = (min, max) => min + Math.random() * (max - min);

function sparkPoints(value) {
    return Array.from({ length: SPARK_POINTS }, (_, index) => {
        const jitter = randomBetween(-3, 3);
        const y = 20 - Math.max(1, Math.min(18, (value / 100) * 16 + jitter));
        return `${index * SPARK_STEP},${y}`;
    }).join(' ');
}

function updateClock() {
    dom.clock.textContent = new Date().toLocaleTimeString('pt-BR');
}

function updateMetrics() {
    const healthy = state.contained;
    const cpu = healthy ? randomBetween(19, 29) : randomBetween(53, 90);
    const ram = randomBetween(47, 74);
    const net = healthy ? randomBetween(0.3, 1.2) : randomBetween(2, 7);

    dom.cpuValue.textContent = `${Math.round(cpu)}%`;
    dom.ramValue.textContent = `${Math.round(ram)}%`;
    dom.netValue.textContent = `${net.toFixed(1)} Mb`;
    dom.cpuLine.setAttribute('points', sparkPoints(cpu));
    dom.ramLine.setAttribute('points', sparkPoints(ram));
    dom.netLine.setAttribute('points', sparkPoints(net * 13));
}

const SUSPICIOUS_LOGS = [
    'sshd[941]: Failed password for invalid user admin from 185.220.101.17',
    'nginx[842]: GET /assets/.cache from 185.220.101.17',
    'systemd[1]: Started Session 18 of user www-data',
    'kernel: eth0: link is up, 1000 Mbps',
    'authpriv: Accepted publickey for www-data from 10.0.0.24',
    'cron[1110]: suspicious task observed in /tmp/.x7',
];
const BENIGN_LOGS = [
    'systemd[1]: Started Session 19 of user www-data',
    'kernel: eth0: link is up, 1000 Mbps',
    'authpriv: Accepted publickey for www-data from 10.0.0.24',
    'nginx[842]: GET / HTTP/1.1 200 from 10.0.0.1',
];

function addLogLine() {
    const pool = state.contained ? BENIGN_LOGS : SUSPICIOUS_LOGS;
    const pick = (items) => items[Math.floor(Math.random() * items.length)];
    const row = document.createElement('div');
    row.className = `logline${!state.contained && Math.random() < 0.45 ? ' hot' : ''}`;

    const time = document.createElement('span');
    time.className = 'logtime';
    const minute = String(Math.floor(randomBetween(14, 26))).padStart(2, '0');
    const second = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    time.textContent = `02:${minute}:${second}`;

    const message = document.createElement('span');
    message.textContent = pick(pool);

    row.append(time, message);
    dom.syslog.prepend(row);
    while (dom.syslog.children.length > MAX_LOG_LINES) dom.syslog.lastElementChild.remove();
}

function startMatrixRain() {
    if (REDUCED_MOTION) return;
    const ctx = dom.matrix.getContext('2d');
    const columns = 22;
    const drops = new Array(columns).fill(0);

    setInterval(() => {
        ctx.fillStyle = 'rgba(7,12,9,.13)';
        ctx.fillRect(0, 0, dom.matrix.width, dom.matrix.height);
        ctx.fillStyle = '#5aff82';
        ctx.font = '11px monospace';
        drops.forEach((y, index) => {
            ctx.fillText(String.fromCharCode(0x30a0 + Math.random() * 96), index * 10, y * 10);
            drops[index] = y * 10 > dom.matrix.height && Math.random() > 0.97 ? 0 : y + 1;
        });
    }, TIMING.matrix);
}

/* ---------- Cadastro do analista ---------- */

const PROFILE_KEY = 'operacao-raiz-perfil';
const DEFAULT_PROFILE = { nome: '', tema: 'verde' };
const THEMES = ['verde', 'roxo', 'azul'];

/* Os dados ficam só neste navegador. Sem acesso ao armazenamento, o cadastro é pedido de novo. */
function readSavedProfile() {
    try {
        const saved = JSON.parse(localStorage.getItem(PROFILE_KEY));
        if (!saved || typeof saved !== 'object') return null;
        return {
            nome: String(saved.nome ?? ''),
            tema: THEMES.includes(saved.tema) ? saved.tema : DEFAULT_PROFILE.tema,
        };
    } catch (error) {
        console.warn('Não foi possível ler o cadastro salvo neste navegador.', error);
        return null;
    }
}

const isCompleteProfile = (profile) => Boolean(profile?.nome);

function saveProfile(profile) {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
        console.warn('Não foi possível salvar o cadastro neste navegador.', error);
    }
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
}

function fillSetupForm(profile) {
    const { elements } = dom.setupForm;
    elements.nome.value = profile.nome;
    dom.setupForm.querySelector(`input[name="tema"][value="${profile.tema}"]`).checked = true;
}

function readSetupForm() {
    const data = new FormData(dom.setupForm);
    return {
        nome: String(data.get('nome') ?? '').trim(),
        tema: data.get('tema') ?? DEFAULT_PROFILE.tema,
    };
}

function findSetupProblem(profile) {
    if (!profile.nome) return 'Informe seu nome completo.';
    return '';
}

function onSetupSubmit(event) {
    event.preventDefault();
    const profile = readSetupForm();
    const problem = findSetupProblem(profile);
    dom.setupError.textContent = problem;
    dom.setupError.hidden = !problem;
    if (problem) {
        dom.setupForm.elements.nome.focus();
        return;
    }

    saveProfile(profile);
    startWithProfile(profile);
}

function startWithProfile(profile) {
    state.profile = profile;
    applyTheme(profile.tema);
    dom.setup.classList.add('hidden');
    runBoot().then(showBriefing);
}

/* O cadastro aparece só na primeira vez. Depois, o perfil salvo é usado direto. */
function openSetup() {
    const saved = readSavedProfile();
    if (isCompleteProfile(saved)) {
        startWithProfile(saved);
        return;
    }
    const profile = saved ?? DEFAULT_PROFILE;
    fillSetupForm(profile);
    applyTheme(profile.tema);
    dom.setupForm.elements.nome.focus();
}

/* ---------- Tela de boot ---------- */

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function appendBootLine(tag, text) {
    const row = document.createElement('div');
    const label = document.createElement('span');
    label.className = `boot-${tag}`;
    label.textContent = BOOT_TAGS[tag];
    row.append(label, ` ${text}`);
    dom.bootLog.append(row);
    dom.bootLog.scrollTop = dom.bootLog.scrollHeight;
}

/* Mostra as linhas de inicialização uma a uma. Com movimento reduzido, exibe tudo de uma vez. */
async function runBoot() {
    dom.boot.classList.remove('hidden');
    const firstName = state.profile.nome.split(' ')[0];
    const welcome = ['info', `Bem-vindo, ${firstName}. Sessão de investigação iniciada.`];
    for (const [tag, text] of [...BOOT_LINES, welcome]) {
        appendBootLine(tag, text);
        if (!REDUCED_MOTION) await wait(TIMING.bootLine);
    }
    await wait(REDUCED_MOTION ? 0 : TIMING.bootEnd);
    dom.boot.classList.add('hidden');
}

function showBriefing() {
    dom.intro.classList.remove('hidden');
    $('#startBtn').focus();
}

/* ---------- Abas e guia de comandos ---------- */

function renderCommandGuide() {
    dom.commandGrid.replaceChildren(...COMMAND_GUIDE.map(({ command, description, example }) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'cmd-card';
        card.addEventListener('click', () => {
            dom.input.value = example;
            dom.input.focus();
        });

        const name = document.createElement('span');
        name.className = 'cmd-name';
        name.textContent = command;
        const text = document.createElement('span');
        text.className = 'cmd-desc';
        text.textContent = description;
        const sample = document.createElement('span');
        sample.className = 'cmd-example';
        sample.textContent = `Exemplo: ${example}`;

        card.append(name, text, sample);
        return card;
    }));
}

function selectTab(tab) {
    dom.tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
        document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
}

function bindTabs() {
    dom.tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectTab(tab));
        tab.addEventListener('keydown', (event) => {
            const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
            if (!step) return;
            event.preventDefault();
            const next = dom.tabs[(index + step + dom.tabs.length) % dom.tabs.length];
            next.focus();
            selectTab(next);
        });
    });
}

/* ---------- Inicialização ---------- */

function startSession() {
    dom.intro.classList.add('hidden');
    print('Conexão estabelecida com srv-web01. ALERTA: atividade suspeita detectada.', 'warn');
    print('Digite help para ver comandos ou comece com pwd.', 'good');
    dom.input.focus();
}

function bindEvents() {
    // "submit" do formulário cobre o Enter do teclado físico e o botão Enviar do celular.
    $('#commandForm').addEventListener('submit', (event) => {
        event.preventDefault();
        submitLine();
    });
    dom.input.addEventListener('keydown', onInputKeydown);
    dom.terminal.addEventListener('click', () => dom.input.focus());
    document.querySelectorAll('[data-key]').forEach((button) => {
        // Evita tirar o foco do campo: no celular, o teclado continua aberto.
        button.addEventListener('mousedown', (event) => event.preventDefault());
        button.addEventListener('click', () => {
            handleKey(button.dataset.key);
            dom.input.focus();
        });
    });
    $('#startBtn').addEventListener('click', startSession);
    $('#skipBtn').addEventListener('click', startSession);
    $('#restartBtn').addEventListener('click', () => location.reload());
    dom.closeFinish.addEventListener('click', () => dom.finish.classList.add('hidden'));
    bindTabs();
    dom.setupForm.addEventListener('submit', onSetupSubmit);
    dom.setupForm.querySelectorAll('input[name="tema"]').forEach((radio) => {
        radio.addEventListener('change', () => applyTheme(radio.value));
    });
}

function init() {
    bindEvents();
    renderCommandGuide();
    render();
    updateClock();
    setInterval(updateClock, TIMING.clock);
    updateMetrics();
    setInterval(updateMetrics, TIMING.metrics);
    for (let index = 0; index < 4; index++) addLogLine();
    setInterval(addLogLine, TIMING.log);
    startMatrixRain();
    openSetup();
}

init();
