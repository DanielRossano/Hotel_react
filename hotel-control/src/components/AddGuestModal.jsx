import { useEffect } from "react";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
import { toast } from "react-toastify";

const resetBodyState = () => {
  document.body.classList.remove("modal-open");
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
};

const AddGuestModal = ({
  newGuest,
  setNewGuest,
  handleAddGuest,
  handleModalClose,
}) => {
  useEffect(() => {
    const modalElement = document.getElementById("addGuestModal");
  
    if (modalElement) {
      const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
  
      const resetOnShow = () => {
        setNewGuest({
          name: "",
          cpf_cnpj: "",
          type: "fisica",
          address: { estado:"", cidade: "", bairro: "", rua: "", numero: "", cep: "" },
          nome_fantasia: "",
        });
      };
  
      const resetOnClose = () => {
        setNewGuest({
          name: "",
          cpf_cnpj: "",
          type: "fisica",
          address: { cidade: "", bairro: "", rua: "", numero: "", cep: "" },
          nome_fantasia: "",
        });
  
        // Remove bloqueios de scroll
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
  
        // Remove o backdrop manualmente (se necessário)
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
  
  const applyMask = (value, mask) => {
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

  const handleInputChange = (value, mask, key) => {
    const maskedValue = applyMask(value, mask);
    setNewGuest({ ...newGuest, [key]: maskedValue });
  };

  const handleAddressChange = (value, field) => {
    setNewGuest((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };
  

  const isCPFValid = (cpf) => {
    return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
  };

  const isCNPJValid = (cnpj) => {
    return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj);
  };

  
  const validateAndSubmit = (e) => {
    e.preventDefault();
  
    if (newGuest.type === "fisica" && !isCPFValid(newGuest.cpf_cnpj)) {
      toast.error("Por favor, insira um CPF válido.");
      return;
    }
  
    if (newGuest.type === "juridica" && !isCNPJValid(newGuest.cpf_cnpj)) {
      toast.error("Por favor, insira um CNPJ válido.");
      return;
    }
  
    // Enviar o cadastro
    handleAddGuest(e);
  
    // Fechar o modal manualmente
    const modalElement = document.getElementById("addGuestModal");
    if (modalElement) {
      const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
      modalBootstrap.hide(); // Fecha o modal
    }
  
    // Remover manualmente o backdrop existente (se necessário)
    setTimeout(() => {
      const backdropElement = document.querySelector(".modal-backdrop");
      if (backdropElement) backdropElement.remove(); // Garante que o backdrop seja removido
    }, 300); // Delay para garantir que o Bootstrap termine de esconder o modal
  };
  

  return (
    <div
      className="modal fade"
      id="addGuestModal"
      tabIndex="-1"
      aria-labelledby="guestModalLabel"
      aria-hidden="true"
    >
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
          <div className="modal-body">
            <form onSubmit={validateAndSubmit}>
              <div className="mb-3 row">
                <label htmlFor="guestType" className="col-sm-3 col-form-label">
                  Tipo
                </label>
                <div className="col-sm-9">
                  <select
                    id="guestType"
                    className="form-select form-select-sm"
                    value={newGuest.type}
                    onChange={(e) =>
                      setNewGuest({ ...newGuest, type: e.target.value })
                    }
                  >
                    <option value="fisica">Pessoa Física</option>
                    <option value="juridica">Pessoa Jurídica</option>
                  </select>
                </div>
              </div>

              <hr />

              <div className="mb-3 row">
                <label htmlFor="guestName" className="col-sm-3 col-form-label">
                  Nome
                </label>
                <div className="col-sm-9">
                  <input
                    id="guestName"
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

              <div className="mb-3 row">
                <label htmlFor="guestCPF" className="col-sm-3 col-form-label">
                  {newGuest.type === "fisica" ? "CPF" : "CNPJ"}
                </label>
                <div className="col-sm-9">
                  <input
                    id="guestCPF"
                    type="text"
                    className="form-control"
                    placeholder={
                      newGuest.type === "fisica" ? "CPF" : "CNPJ"
                    }
                    value={newGuest.cpf_cnpj}
                    onChange={(e) =>
                      handleInputChange(
                        e.target.value,
                        newGuest.type === "fisica"
                          ? "999.999.999-99"
                          : "99.999.999/9999-99",
                        "cpf_cnpj"
                      )
                    }
                    required
                  />
                </div>
              </div>

              <hr />

              {/* Endereço */}
              {/* Estado */}
<div className="mb-3 row">
  <label htmlFor="guestEstado" className="col-sm-3 col-form-label">
    Estado
  </label>
  <div className="col-sm-9">
    <select
      id="guestEstado"
      className="form-select"
      value={newGuest.address.estado}
      onChange={(e) =>
        handleAddressChange(e.target.value, "estado")
      }
      required
    >
      <option value="" disabled>
       Estado
      </option>
      {[
        "AC",
        "AL",
        "AP",
        "AM",
        "BA",
        "CE",
        "DF",
        "ES",
        "GO",
        "MA",
        "MT",
        "MS",
        "MG",
        "PA",
        "PB",
        "PR",
        "PE",
        "PI",
        "RJ",
        "RN",
        "RS",
        "RO",
        "RR",
        "SC",
        "SP",
        "SE",
        "TO",
      ].map((estado) => (
        <option key={estado} value={estado}>
          {estado}
        </option>
      ))}
    </select>
  </div>
</div>
{["cidade", "bairro", "rua", "numero", "cep"].map((field) => (
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
        value={newGuest.address[field]}
        onChange={(e) =>
          handleAddressChange(
            applyMask(
              e.target.value,
              field === "cep" ? "99999-999" : "999999"
            ),
            field
          )
        }
        required
      />
    </div>
  </div>
))}

              <div className="modal-footer">
              <button
  type="button"
  className="btn btn-sm btn-secondary rounded"
  data-bs-dismiss="modal"
  onClick={() => {
    const modalElement = document.getElementById("addGuestModal");
    if (modalElement) {
      const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
      modalBootstrap.hide(); // Fecha o modal
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
      modalBootstrap.show(); // Exibe o modal, recriando o backdrop
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
    </div>
  );
};

export default AddGuestModal;
