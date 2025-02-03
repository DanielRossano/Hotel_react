import { toast } from "react-toastify";
import fetchAddressByCEP from "../services/buscacep";

// Função para aplicar máscara aos valores de entrada
export const applyMask = (value, mask) => {
    const cleanValue = value.replace(/\D/g, ""); 
    let maskedValue = "";
    let cleanIndex = 0;

    for (let i = 0; i < mask.length; i++) {
        if (mask[i] === "9") {
            if (cleanIndex < cleanValue.length) {
                maskedValue += cleanValue[cleanIndex];
                cleanIndex++;
            } else {
                break;
            }
        } else {
            maskedValue += mask[i];
        }
    }

    return maskedValue;
};

// Função para lidar com mudanças de entrada com máscara
export const handleInputChange = (value, mask, key, newGuest, setNewGuest) => {
    if (!newGuest) {
      console.error('newGuest não está definido!');
      return;
    }
  
    const maskedValue = applyMask(value, mask);
    setNewGuest({ ...newGuest, [key]: maskedValue });
    console.log('Valor atualizado de newGuest:', { ...newGuest, [key]: maskedValue });
  };

  // Função para lidar com mudanças de entrada de endereco
export const handleAddressChange = (value, field, setNewGuest) => {
    if (!setNewGuest) {
      console.error('setNewGuest não está definido!');
      return;
    }
  
    setNewGuest((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };
  
// Função para lidar com mudanças de CEP
export const handleCEPChange = async (e, setNewGuest) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const maskedValue = applyMask(e.target.value, "99999-999");
   setNewGuest((prev) => ({
        ...prev,   
        address: {
            ...prev.address,
            cep: maskedValue,
        },
    }));
    if (rawValue.length === 8) {
        try {
            const address = await fetchAddressByCEP(rawValue);
            setNewGuest((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    rua: address.logradouro || "",
                    bairro: address.bairro || "",
                    cidade: address.localidade || "",
                    estado: address.uf || "",
                },
            }));
        } catch (error) {
            console.error("Erro ao buscar endereço:", error);
            toast.error("CEP inválido ou não encontrado.");
        }
    }
};
