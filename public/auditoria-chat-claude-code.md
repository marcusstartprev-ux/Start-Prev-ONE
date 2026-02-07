# Auditoria Completa — chat.html
## Instruções para a IA

Analise o arquivo `public/chat.html` completo, linha por linha. Responda CADA pergunta abaixo com:
- ✅ **Implementado e funcionando** — se o código existe E está correto
- ⚠️ **Implementado com problemas** — se o código existe MAS tem bugs ou está incompleto
- ❌ **Não implementado** — se não existe no código
- Para cada item, cite o número da linha relevante.

---

## BLOCO 1 — INICIALIZAÇÃO E PERFORMANCE

1.1. Existem tags `<link rel="preconnect">` no `<head>` para os domínios: fonts.googleapis.com, fonts.gstatic.com, cdn.jsdelivr.net e o endpoint do Supabase (tvlinuakttpvbwoirdkk.supabase.co)?

1.2. O script do Supabase SDK (`supabase-js`) tem um `<link rel="preload" as="script">` correspondente? A URL do preload é EXATAMENTE a mesma URL do `<script src="...">`? Compare as duas URLs caractere por caractere.

1.3. O logo principal (`/logo-start.png`) tem preload no `<head>`?

1.4. Qual é a sequência EXATA de inicialização no `DOMContentLoaded`? Liste em ordem cronológica cada coisa que acontece, incluindo todos os `setTimeout` com seus valores em ms. Monte um diagrama de timeline mostrando o que executa em paralelo e o que é sequencial.

1.5. O carregamento do histórico do Supabase (`carregarMensagensAnteriores`) roda em PARALELO com a animação da welcome screen, ou roda DEPOIS que a animação termina? Mostre o trecho de código que comprova.

1.6. A função `scr()` (scroll para baixo) usa `requestAnimationFrame` ou `setTimeout`? Cite a linha.

---

## BLOCO 2 — SUPABASE REALTIME

2.1. A função `iniciarRealtime()` é chamada em que momento? É chamada dentro do `DOMContentLoaded`? É chamada ANTES ou DEPOIS dos `setTimeout` da animação?

2.2. O Supabase SDK é carregado de forma síncrona ou assíncrona no `<head>`? O `<script>` tem atributo `async` ou `defer`? Isso pode causar race condition com `window.supabase.createClient` na inicialização?

2.3. Quando o Realtime recebe uma mensagem do assessor, o que acontece EXATAMENTE? Liste toda a cadeia: callback → quais funções chama → o que renderiza na tela.

2.4. Existe tratamento de reconexão? Se a conexão WebSocket cair (cliente perde internet), o código faz algum "catch-up" buscando mensagens que foram perdidas durante a desconexão? Procure por: `subscribe` com callback de status, `CLOSED` ou `CHANNEL_ERROR`, ou qualquer `fetch` condicional que busque mensagens após reconexão.

2.5. A subscription Realtime filtra por `session_id` no lado do servidor? Mostre o filtro exato.

2.6. Quando uma mensagem chega via Realtime, ela é marcada como `entregue_at`? Qual campo é atualizado e como?

---

## BLOCO 3 — ENVIO DE MENSAGENS (CLIENTE → SERVIDOR)

3.1. Quando a cliente envia uma mensagem de TEXTO, para onde ela vai? Liste TODOS os destinos (Supabase insert, webhook fetch, etc.) e a ordem.

3.2. Quando a cliente envia um ARQUIVO ou IMAGEM, o fluxo é: upload pro Supabase Storage → pega URL pública → salva registro na tabela messages → envia metadata pro webhook? Confirme se esse é o fluxo exato ou se há diferenças.

3.3. Quando a cliente grava um ÁUDIO, o fluxo é similar ao de arquivo? O áudio é salvo como webm no Storage? Confirme o fluxo completo.

3.4. Existe tratamento de erro em TODOS os fluxos de envio? Se o upload falhar, o que acontece? Se o insert no Supabase falhar? Se o webhook falhar? Para cada um, diga se há try/catch e o que é mostrado ao usuário.

3.5. Existe a função `autoReply`? Ela é chamada em algum lugar do código, ou é dead code? Se é dead code, cite a linha onde ela é definida.

3.6. Após enviar qualquer mensagem, o indicador "digitando..." aparece? Usa `showTypSafe()` com timeout de segurança? Qual é o timeout padrão?

---

## BLOCO 4 — CARREGAMENTO DE HISTÓRICO

4.1. A função `carregarMensagensAnteriores()` tem `.limit()` na query? Quantas mensagens carrega? Se não tem limit, qual é o risco?

4.2. A função `carregarMensagensAnteriores()` renderiza as mensagens com animação ou sem? Quando carrega 50 mensagens de histórico, todas animam ao mesmo tempo?

4.3. Existe a função `recuperarMensagens()` (botão manual)? Ela carrega mensagens de que período — só de hoje, ou de toda a sessão? Cite o filtro de data usado.

4.4. O botão "Carregar mensagens anteriores" (id=`loadHistoryBtn`) começa visível ou hidden? Ele deveria começar hidden e só aparecer se houver histórico?

4.5. Quando `carregarMensagensAnteriores()` retorna dados, as mensagens do histórico aparecem ANTES ou DEPOIS do separador de data "Hoje · Terça"? Qual é a ordem visual correta e o que realmente acontece?

4.6. Se a sessão não tem histórico (é nova), o que aparece? A saudação personalizada + card de análise? Confirme a lógica de decisão entre "tem histórico" e "não tem".

---

## BLOCO 5 — PUSH NOTIFICATIONS

5.1. A função `savePushToken()` — quantas vezes é DEFINIDA no código? Se for mais de uma vez, a segunda sobrescreve a primeira? A versão que está ativa envia o token para o webhook (N8N) E para o Supabase, ou só para um dos dois?

5.2. A solicitação de permissão de push é automática (setTimeout) ou manual (botão)? O auto-request com setTimeout de 10s foi REMOVIDO ou ainda existe?

5.3. A função `checkExistingPushSubscription()` é chamada quando? Usa `requestIdleCallback`?

5.4. A VAPID_PUBLIC_KEY está hardcoded no código? Qual é o valor?

---

## BLOCO 6 — ÁUDIO E WAVEFORM

6.1. A função `analyzeAudioWaveform()` cria um novo `AudioContext` a cada chamada? Se sim, isso pode causar problemas com limite de contextos do navegador?

6.2. O `IntersectionObserver` (`waveformObserver`) existe? Ele é usado para fazer lazy loading do waveform — ou seja, só analisa o áudio quando o player fica visível na tela?

6.3. Os áudio players (objeto `aPlayers`) são criados com `setTimeout` de 50ms após renderizar. Por que esse delay? Pode causar problemas?

6.4. As barras do waveform começam com altura fixa (8px) e são atualizadas depois com valores reais? Ou começam com valores aleatórios?

---

## BLOCO 7 — SEGURANÇA E DADOS SENSÍVEIS

7.1. A `SUPABASE_ANON_KEY` está hardcoded no JavaScript do cliente? (Isso é esperado — anon key é pública por design)

7.2. A `SUPABASE_URL` está hardcoded? 

7.3. A `VAPID_PUBLIC_KEY` está hardcoded?

7.4. Existe alguma `service_role` key, senha, ou token secreto exposto no código do cliente? Procure por qualquer string que contenha "service_role", "secret", "password", "private_key" etc.

7.5. O session_id é gerado como? É previsível ou tem componente aleatório? Pode ser manipulado pela URL?

7.6. Existe validação dos parâmetros da URL (nome, celular, etc.)? Se alguém acessar o chat sem parâmetros, o que acontece?

---

## BLOCO 8 — UX E VISUAL

8.1. A welcome screen tem animação de logo com anel giratório? Quanto tempo fica visível (em ms)?

8.2. O header mostra "Online agora" com ponto verde pulsante? O nome do atendente é dinâmico ou fixo ("Marcus — Start Prev")?

8.3. O logo é dinâmico baseado na origem (Start Prev vs Mãe Social)? Cite a lógica.

8.4. O CTA "Vamos ver se posso receber mais de R$ 5 mil?" existe no card? Quando clicado, o que acontece? (mensagem automática + desabilita botão + webhook?)

8.5. A gravação de áudio mostra barras animadas durante a gravação? Tem botão de cancelar?

8.6. Imagens podem ser abertas em fullscreen? Existe overlay de tela cheia?

8.7. As imagens no histórico usam `loading="lazy"`?

---

## BLOCO 9 — MEMORY LEAKS E CLEANUP

9.1. Object URLs criados com `URL.createObjectURL()` são revogados depois? Existe tracking com array `objectUrls`? Existe listener `beforeunload` que limpa?

9.2. Os streams de áudio do microfone (`getUserMedia`) são parados (`track.stop()`) quando a gravação termina ou é cancelada?

9.3. O `setInterval` da gravação (timer de segundos) é limpo com `clearInterval` quando para ou cancela?

---

## BLOCO 10 — FUNÇÕES E CÓDIGO MORTO

10.1. Liste TODAS as funções definidas no código (nome e linha). Para cada uma, diga se é chamada em algum lugar ou se é dead code.

10.2. Existe alguma variável definida mas nunca usada?

10.3. Existem console.log/console.error que deveriam ser removidos para produção, ou eles são úteis para debugging?

---

## BLOCO 11 — RESUMO EXECUTIVO

Após analisar tudo acima, forneça:

11.1. Uma lista das **funcionalidades 100% prontas** para produção.

11.2. Uma lista das **funcionalidades com bugs** que precisam de correção antes de ir para produção.

11.3. Uma lista das **funcionalidades que faltam** para o chat funcionar completo em produção.

11.4. As **3 correções mais urgentes** que devem ser feitas PRIMEIRO, em ordem de impacto.

11.5. Estimativa de esforço: quantas linhas de código precisam ser alteradas/adicionadas para resolver todos os problemas encontrados?
