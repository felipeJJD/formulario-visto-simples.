document.addEventListener('DOMContentLoaded', function() {
  // Referências aos elementos do DOM
  const form = document.getElementById('visa-form');
  const submissionAlert = document.getElementById('submission-alert');
  const errorAlert = document.getElementById('error-alert');
  
  // Elementos para exibição condicional
  const travelPaymentSelect = document.getElementById('travelPayment');
  const sponsorSection = document.getElementById('sponsorSection');
  const relativesInUSSelect = document.getElementById('relativesInUS');
  const usContactSection = document.getElementById('usContactSection');
  
  // Handlers para exibição condicional de seções
  if (travelPaymentSelect) {
    travelPaymentSelect.addEventListener('change', function() {
      if (this.value === 'Outra pessoa') {
        sponsorSection.style.display = 'block';
      } else {
        sponsorSection.style.display = 'none';
      }
    });
  }
  
  if (relativesInUSSelect) {
    relativesInUSSelect.addEventListener('change', function() {
      if (this.value === 'Sim') {
        usContactSection.style.display = 'block';
      } else {
        usContactSection.style.display = 'none';
      }
    });
  }
  
  // Handler para envio do formulário
  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    try {
      // Mostrar indicador de carregamento ou desabilitar o botão aqui
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';
      
      // Coletar todos os dados do formulário
      const formData = new FormData(form);
      const formDataObj = {};
      
      formData.forEach((value, key) => {
        formDataObj[key] = value;
      });
      
      console.log('Enviando dados:', formDataObj);
      
      // Enviar para o servidor
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDataObj)
      });
      
      const result = await response.json();
      
      // Resetar botão
      submitButton.disabled = false;
      submitButton.innerHTML = 'Enviar Formulário';
      
      if (response.ok) {
        console.log('Sucesso:', result);
        
        // Mostrar mensagem de sucesso
        submissionAlert.classList.remove('d-none');
        submissionAlert.classList.add('fade-in');
        
        // Esconder mensagem de erro se estiver visível
        errorAlert.classList.add('d-none');
        
        // Rolar para o topo para mostrar alerta
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Limpar formulário
        form.reset();
        
        // Esconder alerta após alguns segundos
        setTimeout(() => {
          submissionAlert.classList.add('d-none');
        }, 10000);
      } else {
        console.error('Erro:', result);
        
        // Mostrar mensagem de erro
        errorAlert.textContent = `Erro ao enviar o formulário: ${result.message || 'Tente novamente mais tarde.'}`;
        errorAlert.classList.remove('d-none');
        errorAlert.classList.add('fade-in');
        
        // Esconder mensagem de sucesso se estiver visível
        submissionAlert.classList.add('d-none');
        
        // Rolar para o topo para mostrar alerta
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Esconder alerta após alguns segundos
        setTimeout(() => {
          errorAlert.classList.add('d-none');
        }, 10000);
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      
      // Resetar botão
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = false;
      submitButton.innerHTML = 'Enviar Formulário';
      
      // Mostrar mensagem de erro
      errorAlert.textContent = 'Erro ao enviar o formulário. Verifique sua conexão e tente novamente.';
      errorAlert.classList.remove('d-none');
      errorAlert.classList.add('fade-in');
      
      // Esconder mensagem de sucesso se estiver visível
      submissionAlert.classList.add('d-none');
      
      // Rolar para o topo para mostrar alerta
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  
  // Melhorias de usabilidade
  
  // Máscaras para campos específicos (exemplo básico)
  const zipCodeInput = document.getElementById('zipCode');
  if (zipCodeInput) {
    zipCodeInput.addEventListener('input', function() {
      let value = this.value.replace(/\D/g, '');
      if (value.length > 8) value = value.slice(0, 8);
      if (value.length > 5) {
        value = value.slice(0, 5) + '-' + value.slice(5);
      }
      this.value = value;
    });
  }
  
  const phoneInput = document.getElementById('primaryPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      let value = this.value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      if (value.length > 2) {
        value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
      }
      if (value.length > 10) {
        value = value.slice(0, 10) + '-' + value.slice(10);
      }
      this.value = value;
    });
  }
});
