import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../styles/modal.css";
import "../styles/button.css";
import { handleInputChange, handleAddressChange, handleCEPChange } from "../services/modalGuestsFunctions";

const resetBodyState = () => {
  document.body.classList.remove("modal-open");
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
};

const AddGuestModal = ({ newGuest, setNewGuest, setGuests, fetchGuests }) => {
  const [showAddress, setShowAddress] = useState(false);

  useEffect(() => {
    const modalElement = document.getElementById("addGuestModal");

    if (modalElement) {
      const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);

      const resetOnShow = () => {
        setNewGuest({
          name: "",
          cpf_cnpj: "",
          telefone: "",
          type: "juridica",
          address: { estado: "", cidade: "", bairro: "", rua: "", numero: "", cep: "" },
          nome_fantasia: "",
        });
        setShowAddress(false);
      };

      const resetOnClose = () => {
        setNewGuest({
          name: "",
          cpf_cnpj: "",
          telefone: "",
          type: "juridica",
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

  const isCPFValid = (cpf) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
  const isCNPJValid = (cnpj) => /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj);

  const handleAddGuest = async () => {
    try {
      await api.post('/guests', newGuest);
      fetchGuests();
      toast.success('Hóspede cadastrado com sucesso!');

      setNewGuest({
        name: "",
        cpf_cnpj: "",
        telefone: "",
        type: "juridica",
        address: { estado: "", cidade: "", bairro: "", rua: "", numero: "", cep: "" },
        nome_fantasia: "",
      });

      const modalElement = document.getElementById('addGuestModal');
      if (modalElement) {
        const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalBootstrap.hide();
        resetBodyState();
      }
    } catch (error) {
      toast.error('Erro ao cadastrar hóspede. Tente novamente.');
    }
  };

  const validateAndSubmit = (e) => {
    e.preventDefault();

    if (!newGuest || !newGuest.type) {
      toast.error("O tipo de hóspede não foi selecionado.");
      return;
    }

    if (newGuest.type === "fisica" && !isCPFValid(newGuest.cpf_cnpj)) {
      toast.error("Por favor, insira um CPF válido.");
      return;
    }

    if (newGuest.type === "juridica" && !isCNPJValid(newGuest.cpf_cnpj)) {
      toast.error("Por favor, insira um CNPJ válido.");
      return;
    }

    handleAddGuest();
  };

  const fetchCNPJData = async (cnpj) => {
    try {
      const cleanedCNPJ = cnpj.replace(/\D/g, '');
      const response = await api.get(`/api/cnpj/${cleanedCNPJ}`);
      const data = response.data;

      setNewGuest((prev) => ({
        ...prev,
        name: data.nome || "",
        nome_fantasia: data.fantasia || "",
        telefone: data.telefone || "",
        address: {
          estado: data.uf || "",
          cidade: data.municipio || "",
          bairro: data.bairro || "",
          rua: data.logradouro || "",
          numero: data.numero || "",
          cep: data.cep || "",
        },
      }));

      setShowAddress(true);
      toast.success('Dados do CNPJ encontrados e preenchidos!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao buscar CNPJ. Verifique o número e tente novamente.');
    }
  };

  return (
    <div className="modal fade" id="addGuestModal" tabIndex="-1" aria-labelledby="guestModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="guestModalLabel">Cadastrar Hóspede</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form onSubmit={validateAndSubmit}>
            <div className="mb-3 row">
              <div className="mb-3 col-md-6">
                <label htmlFor="newGuestType" className="col-sm-3 col-form-label">Tipo:</label>
                <select
                  id="newGuestType"
                  className="form-select form-select-sm"
                  value={newGuest?.type || "juridica"}
                  onChange={(e) => setNewGuest((prev) => ({ ...prev, type: e.target.value }))}
                  required
                >
                  <option value="juridica">Pessoa Jurídica</option>
                  <option value="fisica">Pessoa Física</option>
                </select>
              </div>
            </div>

            <hr />

            <div className="row">
              <div className="mb-3 col-md-6">
                <label htmlFor="newGuestName" className="form-label">Nome:</label>
                <input
                  id="newGuestName"
                  type="text"
                  className="form-control"
                  placeholder="Nome"
                  value={newGuest.name.toUpperCase()}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="mb-3 col-md-6">
                <label htmlFor="newGuestPhone" className="form-label">Telefone:</label>
                <input
                  id="newGuestPhone"
                  type="text"
                  className="form-control"
                  placeholder="Telefone"
                  value={newGuest.telefone}
                  onChange={(e) => handleInputChange(e.target.value, '(99) 99999-9999', 'telefone', newGuest, setNewGuest)}
                />
              </div>

              <div className="mb-3 col-md-6">
                <label htmlFor="guestCPF" className="form-label">
                  {newGuest.type === "fisica" ? "CPF" : "CNPJ"}:
                </label>
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
                />
                {newGuest.type === "juridica" && (
                  <button type="button" className="btn-buscar" onClick={() => fetchCNPJData(newGuest.cpf_cnpj)}>
                    Buscar
                  </button>
                )}
              </div>

              {newGuest.type === "juridica" && (
                <div className="mb-3 col-md-6">
                  <label htmlFor="guestFantasyName" className="form-label">Nome Fantasia:</label>
                  <input
                    id="guestFantasyName"
                    type="text"
                    className="form-control"
                    placeholder="Opcional"
                    value={newGuest.nome_fantasia.toUpperCase()}
                    onChange={(e) => setNewGuest({ ...newGuest, nome_fantasia: e.target.value })}
                  />
                </div>
              )}
            </div>

            <hr />

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

            {showAddress && (
              <div className="row">
                <div className="mb-3 col-md-6">
                  <label htmlFor="guestCEP" className="form-label">CEP:</label>
                  <input
                    id="guestCEP"
                    type="text"
                    className="form-control"
                    placeholder="CEP"
                    value={newGuest.address?.cep || ""}
                    onChange={(e) => handleCEPChange(e, setNewGuest)}
                  />
                </div>

                {["estado", "cidade", "bairro", "rua", "numero"].map((field) => (
                  <div key={field} className="mb-3 col-md-6">
                    <label htmlFor={`guest${field}`} className="form-label">
                      {field[0].toUpperCase() + field.slice(1)}:
                    </label>
                    <input
                      id={`guest${field}`}
                      type="text"
                      className="form-control"
                      placeholder={field[0].toUpperCase() + field.slice(1)}
                      value={newGuest.address[field] || ""}
                      onChange={(e) => handleAddressChange(e.target.value, field, setNewGuest)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="btn btn-sm btn-danger" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button type="submit" className="btn btn-sucess">
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