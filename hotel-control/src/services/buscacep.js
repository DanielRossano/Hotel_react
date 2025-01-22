import axios from 'axios';

const fetchAddressByCEP = async (cep) => {
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    if (response.data.erro) {
      throw new Error('CEP não encontrado');
    }
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar endereço:', error);
    throw new Error('Erro ao buscar o endereço. Verifique o CEP e tente novamente.');
  }
};

export default fetchAddressByCEP;
