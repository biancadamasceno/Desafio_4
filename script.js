document.addEventListener('DOMContentLoaded', function () {
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');
  const ctx = document.getElementById('idebChart').getContext('2d');

  const anoSelect = document.getElementById('ano');
  const redeSelect = document.getElementById('rede');
  const cicloSelect = document.getElementById('ciclo');

  const baseURL = 'https://api.qedu.org.br/v1/ideb';
  const token = '74gJDM30aoIcEpEVz78MNeujjpjuPGQrwve6NnFx';

  const estados = [
    { id: 12, nome: 'AC' }, { id: 27, nome: 'AL' }, { id: 13, nome: 'AM' },
    { id: 16, nome: 'AP' }, { id: 29, nome: 'BA' }, { id: 23, nome: 'CE' },
    { id: 53, nome: 'DF' }, { id: 32, nome: 'ES' }, { id: 52, nome: 'GO' },
    { id: 21, nome: 'MA' }, { id: 31, nome: 'MG' }, { id: 50, nome: 'MS' },
    { id: 51, nome: 'MT' }, { id: 15, nome: 'PA' }, { id: 25, nome: 'PB' },
    { id: 26, nome: 'PE' }, { id: 22, nome: 'PI' }, { id: 41, nome: 'PR' },
    { id: 33, nome: 'RJ' }, { id: 24, nome: 'RN' }, { id: 43, nome: 'RS' },
    { id: 11, nome: 'RO' }, { id: 14, nome: 'RR' }, { id: 42, nome: 'SC' },
    { id: 28, nome: 'SE' }, { id: 35, nome: 'SP' }, { id: 17, nome: 'TO' }
  ];

  let idebChart;

  async function fetchAndRender() {
    const ano = anoSelect.value;
    const dependencia_id = redeSelect.value;
    const ciclo_id = cicloSelect.value;

    if (!ano || !dependencia_id || !ciclo_id) {
    errorElement.textContent = 'Por favor, selecione ano, rede e ciclo para visualizar os dados.';
    errorElement.style.display = 'block';
    if (idebChart) {
      idebChart.destroy();
      idebChart = null;
    }
    loadingElement.style.display = 'none';
    return;
  }

    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';

    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const labels = [];
    const dataValues = [];

    try {
      for (const estado of estados) {
        const params = new URLSearchParams({
          id: estado.id,
          ano,
          dependencia_id,
          ciclo_id
        });

        const response = await axios.get(`${baseURL}?${params.toString()}`, { headers });
        const valorIdeb = parseFloat(response.data?.data?.[0]?.ideb);
        if (!isNaN(valorIdeb)) {
          labels.push(estado.nome);
          dataValues.push(valorIdeb);
        }
      }

        if (dataValues.length === 0) {
        throw new Error('Opa! Dados não encontrados na API para os filtros selecionados.');
       }

      if (idebChart) {
        idebChart.destroy();
      }

      idebChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: `IDEB ${ano}, ${dependencia_id}, ${ciclo_id}`,
            data: dataValues,
            backgroundColor: 'rgba(11, 121, 44, 0.6)',
            borderColor: 'rgb(10, 151, 69)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true,
              title: { display: true, text: 'Nota IDEB' }
            },
            y: {
              title: { display: true, text: 'Estados' }
            }
          }
        }
      });

    } catch (error) {
      console.error('Erro:', error);

      if (idebChart) {
        idebChart.destroy();
        idebChart = null;
      }

      errorElement.textContent = 'Erro ao buscar dados: ' + error.message;
      errorElement.style.display = 'block';
    }

    loadingElement.style.display = 'none';
  }

  anoSelect.addEventListener('change', fetchAndRender);
  redeSelect.addEventListener('change', fetchAndRender);
  cicloSelect.addEventListener('change', fetchAndRender);

  fetchAndRender();
});
