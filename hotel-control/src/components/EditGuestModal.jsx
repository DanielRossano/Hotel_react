import { useEffect } from "react";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
import { handleInputChange, handleAddressChange } from "../services/modalGuestsFunctions";
import { toast } from "react-toastify";

const resetBodyState = () => {
  document.body.classList.remove("modal-open");
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
};

const EditGuestModal = ({ editGuest, setEditGuest, handleUpdateGuest, handleDeleteGuest }) => {
  useEffect(() => {
    const modalElement = document.getElementById("editGuestModal");

    if (modalElement) {
      const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);

      const resetOnClose = () => {
        setEditGuest(null); // Reseta o estado do hóspede sendo editado
        resetBodyState(); // Reseta o estado do body
        const backdropElement = document.querySelector(".modal-backdrop");
        if (backdropElement) backdropElement.remove(); // Remove backdrop extra
      };

      modalElement.addEventListener("hidden.bs.modal", resetOnClose);

      return () => {
        modalElement.removeEventListener("hidden.bs.modal", resetOnClose);
      };
    }
  }, [setEditGuest]);

  if (!editGuest) return null; // Evita renderizar se não houver hóspede em edição

  const handleSubmit = (e) => {
    e.preventDefault();

    // Valida CPF ou CNPJ
    if (editGuest.type === "fisica" && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(editGuest.cpf_cnpj)) {
      toast.error("Por favor, insira um CPF válido.");
      return;
    }

    if (editGuest.type === "juridica" && !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(editGuest.cpf_cnpj)) {
      toast.error("Por favor, insira um CNPJ válido.");
      return;
    }

    handleUpdateGuest(editGuest); // Envia o hóspede atualizado
  };

  const confirmAndDeleteGuest = async () => {
    if (window.confirm("Tem certeza de que deseja excluir este hóspede?")) {
      try {
        await handleDeleteGuest(editGuest.id); // Chama a função de exclusão
        const modalElement = document.getElementById("editGuestModal");
        if (modalElement) {
          const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
          modalBootstrap.hide(); // Fecha o modal
        }
      } catch (error) {
        console.error("Erro ao excluir hóspede:", error);
        toast.error("Não foi possível excluir o hóspede.");
      }
    }
  };

  return (
    <div
      className="modal fade"
      id="editGuestModal"
      tabIndex="-1"
      aria-labelledby="editGuestModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="editGuestModalLabel">
              Editar Hóspede
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Nome */}
              <div className="mb-3 row">
                <label htmlFor="editGuestName" className="col-sm-3 col-form-label">
                  Nome
                </label>
                <div className="col-sm-9">
                  <input
                    id="editGuestName"
                    type="text"
                    className="form-control"
                    value={editGuest.name || ""}
                    onChange={(e) => setEditGuest({ ...editGuest, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* CPF/CNPJ */}
              <div className="mb-3 row">
                <label htmlFor="editGuestCPF" className="col-sm-3 col-form-label">
                  {editGuest.type === "1" ? "CNPJ:" : "CPF:"}
                </label>
                <div className="col-sm-9">
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
                    required
                  />
                </div>
              </div>

              {/* Campos de Endereço */}
              {["estado", "cidade", "bairro", "rua", "numero", "cep"].map((field) => (
                <div key={field} className="mb-3 row">
                  <label
                    htmlFor={`editGuest${field}`}
                    className="col-sm-3 col-form-label"
                  >
                    {field[0].toUpperCase() + field.slice(1)}
                  </label>
                  <div className="col-sm-9">
                    <input
                      id={`editGuest${field}`}
                      type="text"
                      className="form-control"
                      value={editGuest.address[field] || ""}
                      onChange={(e) => handleAddressChange(e.target.value, field, setEditGuest)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmAndDeleteGuest}
              >
                Excluir
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGuestModal;
