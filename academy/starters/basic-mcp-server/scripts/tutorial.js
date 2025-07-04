// Tutorial Interativo MCP Academy
import inquirer from 'inquirer';
import chalk from 'chalk';

const lessons = [
  {
    title: 'Introdução ao MCP',
    content: `
${chalk.cyan('=== Bem-vindo ao MCP Academy! ===')}\n
O Model Context Protocol (MCP) é um protocolo que permite a comunicação
entre diferentes sistemas de IA e ferramentas. Neste tutorial, você
aprenderá como criar seu primeiro servidor MCP.\n
${chalk.yellow('Conceitos Básicos:')}
- Servidor MCP: Provê funcionalidades via ferramentas
- Ferramentas: Funções que podem ser chamadas remotamente
- Transporte: Meio de comunicação (stdio, websocket, etc.)
    `,
    quiz: [
      {
        type: 'list',
        name: 'q1',
        message: 'Qual é o principal objetivo do MCP?',
        choices: [
          'Criar websites',
          'Comunicação entre sistemas de IA',
          'Programação em Python',
          'Desenvolvimento mobile'
        ],
        correct: 1
      }
    ]
  },
  {
    title: 'Criando uma Ferramenta',
    content: `
${chalk.cyan('=== Criando sua Primeira Ferramenta MCP ===')}\n
Uma ferramenta MCP possui:
${chalk.yellow('1. Nome:')} Identificador único
${chalk.yellow('2. Descrição:')} O que a ferramenta faz
${chalk.yellow('3. Schema:')} Estrutura dos dados de entrada
${chalk.yellow('4. Handler:')} Função que processa a requisição\n
Exemplo:
${chalk.gray(`
{
  name: 'hello_world',
  description: 'Diz olá',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  },
  handler: async ({name}) => ({
    message: \`Olá, \${name}!\`
  })
}`)}
    `,
    practice: {
      task: 'Modifique a ferramenta hello_world para aceitar um parâmetro "language"',
      template: `
// Sua ferramenta aqui:
const myTool = {
  name: 'hello_world',
  description: 'Diz olá em diferentes idiomas',
  inputSchema: {
    // Complete o schema
  },
  handler: async (args) => {
    // Implemente o handler
  }
};
      `,
      solution: `
const myTool = {
  name: 'hello_world',
  description: 'Diz olá em diferentes idiomas',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      language: { 
        type: 'string',
        enum: ['pt', 'en', 'es']
      }
    },
    required: ['name', 'language']
  },
  handler: async ({name, language}) => {
    const greetings = {
      pt: 'Olá',
      en: 'Hello',
      es: 'Hola'
    };
    return {
      message: \`\${greetings[language]}, \${name}!\`
    };
  }
};
      `
    }
  },
  {
    title: 'Configurando o Servidor',
    content: `
${chalk.cyan('=== Configuração do Servidor MCP ===')}\n
Para criar um servidor MCP:

1. ${chalk.yellow('Inicialização:')}
   const server = new Server({
     name: 'meu-servidor',
     version: '1.0.0'
   });

2. ${chalk.yellow('Configurar Handlers:')}
   server.setRequestHandler('list_tools', ...);
   server.setRequestHandler('call_tool', ...);

3. ${chalk.yellow('Conectar Transporte:')}
   const transport = new StdioServerTransport();
   await server.connect(transport);
    `,
    quiz: [
      {
        type: 'checkbox',
        name: 'q1',
        message: 'Quais são os componentes essenciais de um servidor MCP?',
        choices: [
          'Nome e versão',
          'Handlers para requisições',
          'Interface gráfica',
          'Transporte'
        ],
        correct: [0, 1, 3]
      }
    ]
  }
];

async function runTutorial() {
  console.clear();
  console.log(chalk.cyan('\n=== MCP Academy - Tutorial Interativo ===\n'));
  
  let currentLesson = 0;
  
  while (currentLesson < lessons.length) {
    const lesson = lessons[currentLesson];
    
    // Mostrar conteúdo
    console.log(chalk.yellow(`\nLição ${currentLesson + 1}: ${lesson.title}`));
    console.log(lesson.content);
    
    // Quiz
    if (lesson.quiz) {
      console.log(chalk.cyan('\n=== Quiz ==='));
      for (const question of lesson.quiz) {
        const answer = await inquirer.prompt(question);
        const isCorrect = Array.isArray(question.correct)
          ? question.correct.every(i => answer[question.name].includes(question.choices[i]))
          : answer[question.name] === question.choices[question.correct];
        
        if (isCorrect) {
          console.log(chalk.green('✓ Correto!'));
        } else {
          console.log(chalk.red('✗ Incorreto. Tente novamente.'));
          continue;
        }
      }
    }
    
    // Prática
    if (lesson.practice) {
      console.log(chalk.cyan('\n=== Prática ==='));
      console.log(chalk.yellow(lesson.practice.task));
      console.log(chalk.gray(lesson.practice.template));
      
      const { tryPractice } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'tryPractice',
          message: 'Quer ver a solução?',
          default: true
        }
      ]);
      
      if (tryPractice) {
        console.log(chalk.green('\nSolução:'));
        console.log(lesson.practice.solution);
      }
    }
    
    // Próxima lição
    const { next } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'next',
        message: 'Continuar para próxima lição?',
        default: true
      }
    ]);
    
    if (next) {
      currentLesson++;
      console.clear();
    }
  }
  
  // Final
  console.log(chalk.green('\n🎉 Parabéns! Você completou o tutorial básico!'));
  console.log(chalk.yellow('\nPróximos passos:'));
  console.log('1. Experimente criar suas próprias ferramentas');
  console.log('2. Explore o código-fonte do servidor');
  console.log('3. Participe da comunidade MCP Academy');
}

runTutorial().catch(console.error);

