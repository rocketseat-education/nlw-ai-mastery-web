# upload.ai

O upload.ai é uma ferramenta que centraliza o upload de novos vídeos para o YouTube adicionando uma camada de inteligência artificial que cria automaticamente títulos chamativos, descrições com um boa indexação, capítulos para os vídeos e até um material em texto rico em formato PDF com o conhecimento do vídeo.

## Fluxo da aplicação

1. O usuário realiza o upload de um vídeo;
2. O app converte o vídeo em áudio utilizando WASM;
3. O áudio é convertido para texto usando o model Whisper;
4. A transcrição é exibida ao usuário que pode corrigi-la caso necessário;
5. O app gera três opções de títulos para o YouTube com grau de "clickbait" diferentes;
6. O app gera uma descrição para o vídeo que pode ser editada pelo usuário;
7. O app gera capítulos para o vídeo com base na transcrição e seus timestamps;
8. O app gera um PDF com base no que é explicado no vídeo;

