;(function () {
  'use strict'

  var ChatforceAI = {
    init: function (config) {
      if (!config || !config.chatbotId) {
        console.error('ChatforceAI: chatbotId is required')
        return
      }

      var chatbotId = config.chatbotId
      var position = config.position || 'bottom-right'
      var primaryColor = config.primaryColor || '#3b82f6'
      var baseUrl = config.baseUrl || 'https://chatforceai.com'

      var sessionId = 'sess_' + Math.random().toString(36).slice(2)
      var isOpen = false
      var conversationId = null

      // Styles
      var style = document.createElement('style')
      style.textContent = [
        '.cfai-widget-btn{position:fixed;bottom:24px;' + (position.includes('right') ? 'right:24px' : 'left:24px') + ';width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.2);z-index:9999;transition:transform .2s}',
        '.cfai-widget-btn:hover{transform:scale(1.08)}',
        '.cfai-window{position:fixed;bottom:90px;' + (position.includes('right') ? 'right:24px' : 'left:24px') + ';width:360px;height:520px;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.25);z-index:9998;display:none;flex-direction:column;background:#0f172a;border:1px solid #1e293b}',
        '.cfai-window.open{display:flex}',
        '.cfai-header{padding:12px 16px;display:flex;align-items:center;gap:10px}',
        '.cfai-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}',
        '.cfai-msg{max-width:85%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.5}',
        '.cfai-msg.user{align-self:flex-end;border-radius:16px 16px 4px 16px;color:#fff}',
        '.cfai-msg.bot{align-self:flex-start;background:#1e293b;color:#e2e8f0;border-radius:16px 16px 16px 4px}',
        '.cfai-input-row{display:flex;gap:8px;padding:12px;border-top:1px solid #1e293b}',
        '.cfai-input{flex:1;background:#1e293b;border:1px solid #334155;border-radius:24px;padding:8px 16px;color:#e2e8f0;font-size:13px;outline:none}',
        '.cfai-send{width:36px;height:36px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0}',
        '.cfai-typing{display:flex;gap:4px;padding:10px 14px;background:#1e293b;border-radius:16px;width:fit-content}',
        '.cfai-dot{width:6px;height:6px;border-radius:50%;background:#64748b;animation:cfai-bounce 1.2s infinite}',
        '.cfai-dot:nth-child(2){animation-delay:.2s}.cfai-dot:nth-child(3){animation-delay:.4s}',
        '@keyframes cfai-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}',
      ].join('')
      document.head.appendChild(style)

      // Button
      var btn = document.createElement('button')
      btn.className = 'cfai-widget-btn'
      btn.style.background = primaryColor
      btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
      document.body.appendChild(btn)

      // Window
      var win = document.createElement('div')
      win.className = 'cfai-window'
      win.innerHTML = [
        '<div class="cfai-header" style="background:' + primaryColor + '">',
        '<div style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center">',
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 8V4H8"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M4 8h16M4 8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2"/></svg>',
        '</div>',
        '<div><p style="color:#fff;font-weight:600;font-size:14px;margin:0">AI Assistant</p><p style="color:rgba(255,255,255,0.7);font-size:11px;margin:0">Powered by ChatforceAI</p></div>',
        '</div>',
        '<div class="cfai-messages" id="cfai-msgs"></div>',
        '<div class="cfai-input-row">',
        '<input class="cfai-input" id="cfai-input" placeholder="Ask me anything..." />',
        '<button class="cfai-send" id="cfai-send" style="background:' + primaryColor + '">',
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
        '</button>',
        '</div>',
      ].join('')
      document.body.appendChild(win)

      var msgs = win.querySelector('#cfai-msgs')
      var input = win.querySelector('#cfai-input')
      var sendBtn = win.querySelector('#cfai-send')

      function addMsg(role, text) {
        var el = document.createElement('div')
        el.className = 'cfai-msg ' + role
        if (role === 'user') el.style.background = primaryColor
        el.textContent = text
        msgs.appendChild(el)
        msgs.scrollTop = msgs.scrollHeight
        return el
      }

      function showTyping() {
        var el = document.createElement('div')
        el.className = 'cfai-typing'
        el.innerHTML = '<div class="cfai-dot"></div><div class="cfai-dot"></div><div class="cfai-dot"></div>'
        msgs.appendChild(el)
        msgs.scrollTop = msgs.scrollHeight
        return el
      }

      async function send() {
        var text = input.value.trim()
        if (!text) return
        input.value = ''
        addMsg('user', text)
        var typing = showTyping()

        try {
          var res = await fetch(baseUrl + '/api/chatbots/' + chatbotId + '/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, sessionId: sessionId, conversationId: conversationId }),
          })
          var data = await res.json()
          typing.remove()
          if (data.conversationId) conversationId = data.conversationId
          addMsg('bot', data.message || 'Sorry, something went wrong.')
        } catch (e) {
          typing.remove()
          addMsg('bot', 'Error connecting to chatbot.')
        }
      }

      btn.addEventListener('click', function () {
        isOpen = !isOpen
        win.classList.toggle('open', isOpen)
        if (isOpen && msgs.children.length === 0) {
          addMsg('bot', 'Hi! How can I help you today?')
        }
        if (isOpen) input.focus()
      })

      sendBtn.addEventListener('click', send)
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') send()
      })
    },
  }

  window.ChatforceAI = ChatforceAI
})()
