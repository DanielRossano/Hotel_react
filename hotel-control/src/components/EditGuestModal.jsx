import { useEffect, useState } from "react";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
import { handleInputChange, handleAddressChange, handleCEPChange } from "../services/modalGuestsFunctions";
import { toast } from "react-toastify";
import api from "../services/api";
import "../styles/modal.css";
import "../styles/button.css";

const resetBodyState = () => {
  document.body.classList.remove("modal-open");
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
};

const EditGuestModal = ({ editGuest, setEditGuest, handleUpdateGuest, handleDeleteGuest }) => {
  const [showAddress, setShowAddress] = useState(false);

  useEffect(() => {
    const modalElement = document.getElementById("editGuestModal");

    if (modalElement) {
      const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);

      const resetOnClose = () => {
        setEditGuest(null);
        resetBodyState();
        const backdropElement = document.querySelector(".modal-backdrop");
        if (backdropElement) backdropElement.remove();
      };

      modalElement.addEventListener("hidden.bs.modal", resetOnClose);

      return () => {
        modalElement.removeEventListener("hidden.bs.modal", resetOnClose);
      };
    }
  }, [setEditGuest]);

  if (!editGuest) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editGuest.type === "0" && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(editGuest.cpf_cnpj)) {
      toast.error("Por favor, insira um CPF válido.");
      return;
    }

    if (editGuest.type === "1" && !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(editGuest.cpf_cnpj)) {
      toast.error("Por favor, insira um CNPJ válido.");
      return;
    }

    handleUpdateGuest(editGuest);
  };

  const confirmAndDeleteGuest = async () => {
    if (window.confirm("Tem certeza de que deseja excluir este hóspede?")) {
      try {
        await handleDeleteGuest(editGuest.id);
        const modalElement = document.getElementById("editGuestModal");
        if (modalElement) {
          const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
          modalBootstrap.hide();
        }
      } catch (error) {
        console.error("Erro ao excluir hóspede:", error);
      }
    }
  };

  const fetchCNPJData = async (cnpj) => {
    try {
      const cleanedCNPJ = cnpj.replace(/\D/g, '');
      const response = await api.get(`/api/cnpj/${cleanedCNPJ}`);
      const data = response.data;

      setEditGuest((prev) => ({
        ...prev,
        name: data.nome || '',
        nome_fantasia: data.fantasia || '',
        telefone: data.telefone || '',
        address: {
          estado: data.uf || '',
          cidade: data.municipio || '',
          bairro: data.bairro || '',
          rua: data.logradouro || '',
          numero: data.numero || '',
          cep: data.cep || '',
        },
      }));

      setShowAddress(true);
      toast.success('Dados do CNPJ encontrados e preenchidos!');
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
      toast.error(error.response?.data?.error || 'Erro ao buscar CNPJ. Verifique o número e tente novamente.');
    }
  };

  return (
    <div className="modal fade" id="editGuestModal" tabIndex="-1" aria-labelledby="editGuestModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="editGuestModalLabel">
              Editar Hóspede
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Seleção do Tipo de Hóspede */}
            <div className="mb-3 row">
              <div className="mb-3 col-md-6">
                <label htmlFor="newGuestType" className="col-sm-3 col-form-label">
                  Tipo:
                </label>
                <select
                  id="editGuestType"
                  className="form-select form-select-sm"
                  value={editGuest?.type || "0"}
                  onChange={(e) => setEditGuest((prev) => ({ ...prev, type: e.target.value }))}
                  required
                >
                  <option value="0">Pessoa Física</option>
                  <option value="1">Pessoa Jurídica</option>
                </select>
              </div>
            </div>
            <hr />
            {/* Nome */}
            <div className="row">
              <div className="mb-3 col-md-6">
                <label htmlFor="editGuestName" className="form-label">
                  Nome:
                </label>
                <input
                  id="editGuestName"
                  type="text"
                  className="form-control"
                  value={editGuest.name ? editGuest.name.toUpperCase() : ""} // Corrigido
                  onChange={(e) => setEditGuest({ ...editGuest, name: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              {/* Telefone */}
              <div className="mb-3 col-md-6">
                <label htmlFor="editGuestTelefone" className="form-label">
                  Telefone:
                </label>
                <input
                  id="editGuestTelefone"
                  type="text"
                  className="form-control"
                  placeholder="Telefone"
                  value={editGuest.telefone || ""}
                  onChange={(e) =>
                    handleInputChange(
                      e.target.value,
                      "(99) 99999-9999",
                      "telefone",
                      editGuest,
                      setEditGuest
                    )
                  }
                />
              </div>
              {/* CPF/CNPJ */}
              <div className="mb-3 col-md-6">
                <label htmlFor="editGuestCPF" className="form-label">
                  {editGuest.type === "1" ? "CNPJ:" : "CPF:"}
                </label>
                <input
                  id="editGuestCPF"
                  type="text"
                  className="form-control"
                  placeholder={editGuest.type === "1" ? "CNPJ:" : "CPF:"}
                  value={editGuest.cpf_cnpj || ""}
                  onChange={(e) =>
                    handleInputChange(
                      e.target.value,
                      editGuest.type === "0" ? "999.999.999-99" : "99.999.999/9999-99",
                      "cpf_cnpj",
                      editGuest,
                      setEditGuest
                    )
                  }
                />
                {editGuest.type === "1" && (
                  <button
                    type="button"
                    className="btn-buscar"
                    onClick={() => fetchCNPJData(editGuest.cpf_cnpj)}
                  >
                    Buscar
                  </button>
                )}
              </div>
              {/* Nome Fantasia */}
              {editGuest.type === "1" && (
                <div className="mb-3 col-md-6">
                  <label htmlFor="guestFantasyName" className="form-label">
                    Nome Fantasia:
                  </label>
                  <input
                    id="guestFantasyName"
                    type="text"
                    className="form-control"
                    placeholder="Opcional"
                    value={editGuest.nome_fantasia ? editGuest.nome_fantasia.toUpperCase() : ""} // Corrigido
                    onChange={(e) =>
                      setEditGuest({ ...editGuest, nome_fantasia: e.target.value.toUpperCase() })
                    }
                  />
                </div>
              )}
              <hr />
            </div>
            {/* Botão para mostrar/esconder endereço */}
            <div className="mb-3 row">
              <div className="col-sm-12">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setShowAddress(!showAddress)}
                >
                  {showAddress ? "Esconder Endereço" : "Mostrar Endereço"}
                </button>
              </div>
            </div>
            {/* Campos de Endereço */}
            {showAddress && (
              <div className="row">
                {/* CEP */}
                <div className="mb-3 col-md-6">
                  <label htmlFor="guestCEP" className="form-label">
                    CEP:
                  </label>
                  <input
                    id="guestCEP"
                    type="text"
                    className="form-control"
                    placeholder="CEP"
                    value={editGuest.address?.cep || ""}
                    onChange={(e) => handleCEPChange(e, setEditGuest)}
                  />
                </div>

                {["estado", "cidade", "bairro", "rua", "numero"].map((field) => (
                  <div key={field} className="mb-3 col-md-6">
                    <label htmlFor={`editGuest${field}`} className="col-sm-3 col-form-label">
                      {field[0].toUpperCase() + field.slice(1)}:
                    </label>
                    <input
                      id={`editGuest${field}`}
                      type="text"
                      className="form-control"
                      value={editGuest.address[field] || ""}
                      onChange={(e) => handleAddressChange(e.target.value, field, setEditGuest)}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="modal-footer">
              <button type="button" className="btn btn-secundary" data-bs-dismiss="modal">
                Voltar
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmAndDeleteGuest}>
                Excluir
              </button>
              <button type="submit" className="btn btn-sucess">
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGuestModal;