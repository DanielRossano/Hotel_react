import { useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
import {handleInputChange, handleAddressChange, handleCEPChange} from "../services/modalGuestsFunctions";

// Função para resetar o estado do body após o modal ser fechado
const resetBodyState = () => {
  document.body.classList.remove("modal-open");
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
};

const AddGuestModal = ({
  newGuest,
  setNewGuest,
  setGuests,
  fetchGuests,
}) => {
  useEffect(() => {
    const modalElement = document.getElementById("addGuestModal");
  
    if (modalElement) {
      const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
  
      const resetOnShow = () => {
        setNewGuest({
          name: "",
          cpf_cnpj: "",
          type: "fisica", // Valor inicial para evitar erros
          address: { estado: "", cidade: "", bairro: "", rua: "", numero: "", cep: "" },
          nome_fantasia: "",
        });
      };
  

      // Função para resetar o estado do hóspede e remover o backdrop do modal quando ele é fechado
      const resetOnClose = () => {
        setNewGuest({
          name: "",
          cpf_cnpj: "",
          type: "fisica",
          address: { estado: "", cidade: "", bairro: "", rua: "", numero: "", cep: "" },
          nome_fantasia: "",
        });

        resetBodyState();

        const backdropElement = document.querySelector(".modal-backdrop");
        if (backdropElement) backdropElement.remove();
      };

      modalElement.addEventListener("show.bs.modal", resetOnShow);
      modalElement.addEventListener("hidden.bs.modal", resetOnClose);

      return () => {
        modalElement.removeEventListener("show.bs.modal", resetOnShow);
        modalElement.removeEventListener("hidden.bs.modal", resetOnClose);
      };
    }
    
  }, [setNewGuest]);

  // Função para validar CPF
const isCPFValid = (cpf) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);

// Função para validar CNPJ
const isCNPJValid = (cnpj) => /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj);
  
const handleAddGuest = async (newGuest, setGuests, setNewGuest, fetchGuests) => {
  try {
    // Faz a requisição para cadastrar o hóspede
    const response = await api.post('/guests', newGuest);

    // Atualiza os hóspedes
    fetchGuests();

    // Exibe mensagem de sucesso
    toast.success('Hóspede cadastrado com sucesso!');

    // Reseta o estado do hóspede
    setNewGuest({
      name: '',
      cpf_cnpj: '',
      type: newGuest.type === "fisica" ? 0 : 1,
      address: {
        estado: '',
        cidade: '',
        bairro: '',
        rua: '',
        numero: '',
        cep: '',
      },
      nome_fantasia: '',
    });

    // Fecha o modal
    const modalElement = document.getElementById('addGuestModal');
    if (modalElement) {
      const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
      if (modalBootstrap) {
        modalBootstrap.hide();
        resetBodyState();
      }
    }
  } catch (error) {
    // Exibe mensagem de erro
    console.error('Erro ao cadastrar hóspede:', error);
    toast.error('Erro ao cadastrar hóspede. Tente novamente.');
  }
};

const validateAndSubmit = (e) => {
  e.preventDefault();
  console.log("Submit acionado com dados:", newGuest);

  if (!newGuest || !newGuest.type) {
    toast.error("O tipo de hóspede não foi selecionado.");
    return;
  }

  // Validar CPF/CNPJ
  if (newGuest.type === "fisica" && !isCPFValid(newGuest.cpf_cnpj)) {
    toast.error("Por favor, insira um CPF válido.");
    return;
  }

  if (newGuest.type === "juridica" && !isCNPJValid(newGuest.cpf_cnpj)) {
    toast.error("Por favor, insira um CNPJ válido.");
    return;
  }

  console.log("Chamando handleAddGuest...");
  handleAddGuest(newGuest, setGuests, setNewGuest, fetchGuests); // Verifique se handleAddGuest está sendo executada
};


  return (
    
<div className="modal fade" id="addGuestModal" tabIndex="-1" aria-labelledby="guestModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="guestModalLabel">
              Cadastrar Hóspede
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
        <form onSubmit={validateAndSubmit}>
          
                         {/* Seleção do Tipo de Hóspede */}
          <div className="modal-body"></div>          
          <div className="mb-3 row">
          <label htmlFor="newGuestType" className="col-sm-3 col-form-label">
                  Tipo
                </label>
                <div className="col-sm-9">
                  <select
                    id="newGuestType"
                    className="form-select form-select-sm"
                    value={newGuest?.type || "fisica"}
                    onChange={(e) => setNewGuest((prev) => ({ ...prev, type: e.target.value }))}
                    required
                  >
                    <option value="fisica">Pessoa Física</option>
                    <option value="juridica">Pessoa Jurídica</option>
                  </select>
                       </div>
                  </div>


              <hr />
{/* Input para Nome do Hóspede */}
            <div className="mb-3 row">
              <label htmlFor="newGuestName" className="col-sm-3 col-form-label">
                Nome
              </label>
              <div className="col-sm-9">
                <input
                  id="newGuestName"
                  type="text"
                  className="form-control"
                  placeholder="Nome"
                  value={newGuest.name}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>
              

            
              {/* CPF/CNPJ */}
              <div className="mb-3 row">
                <label htmlFor="guestCPF" className="col-sm-3 col-form-label">
                  {newGuest.type === "fisica" ? "CPF" : "CNPJ"}
                </label>
                <div className="col-sm-9">
                  <input
                    id="guestCPF"
                    type="text"
                    className="form-control"
                    placeholder={newGuest.type === "fisica" ? "CPF" : "CNPJ"}
                    value={newGuest.cpf_cnpj}
                    onChange={(e) =>
                      handleInputChange(
                        e.target.value,
                        newGuest.type === 'fisica' ? '999.999.999-99' : '99.999.999/9999-99',
                        'cpf_cnpj',
                        newGuest,
                        setNewGuest
                      )
                    }
                    required
                  />
                </div>
              </div>
              
              {/* Nome Fantasia */}
              {newGuest.type === "juridica" && (
                <div className="mb-3 row">
                  <label htmlFor="guestFantasyName" className="col-sm-3 col-form-label">
                    Nome Fantasia
                  </label>
                  <div className="col-sm-9">
                    <input
                      id="guestFantasyName"
                      type="text"
                      className="form-control"
                      placeholder="Nome Fantasia"
                      value={newGuest.nome_fantasia}
                      onChange={(e) =>
                        setNewGuest({ ...newGuest, nome_fantasia: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
              <hr />
              {/* CEP */}
              <div className="mb-3 row">
                <label htmlFor="guestCEP" className="col-sm-3 col-form-label">
                  CEP
                </label>
                <div className="col-sm-9">
                  <input
                    id="guestCEP"
                    type="text"
                    className="form-control"
                    placeholder="CEP"
                    value={newGuest.address?.cep || ""}
                    onChange={(e) => handleCEPChange(e, setNewGuest)}
                    required
                  />
                </div>
              </div>
              
              {/* Campos de endereço */}
              {["estado", "cidade", "bairro", "rua", "numero"].map((field) => (
                <div key={field} className="mb-3 row">
                  <label
                    htmlFor={`guest${field}`}
                    className="col-sm-3 col-form-label"
                  >
                    {field[0].toUpperCase() + field.slice(1)}
                  </label>
                  <div className="col-sm-9">
                    <input
                      id={`guest${field}`}
                      type="text"
                      className="form-control"
                      placeholder={field[0].toUpperCase() + field.slice(1)}
                      value={newGuest.address[field] || ""}
                      onChange={(e) => handleAddressChange(e.target.value, field, setNewGuest)}
                      required
                    />
                  </div>
                </div>
              ))}

              {/* Adicione os campos necessários */}
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary rounded"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    const modalElement = document.getElementById('addGuestModal');
                    if (modalElement) {
                      const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
                      modalBootstrap.hide();
                    }
                  }}
                >
                  Cancelar
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const modalElement = document.getElementById("addGuestModal");
                    if (modalElement) {
                      const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
                      modalBootstrap.show();
                    }
                  }}
                >
                  Cadastrar
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AddGuestModal;
