import React from 'react';
import Swal from "sweetalert2";

const EditGuestModal = ({
  editGuest,
  setEditGuest,
  handleUpdateGuest,
  handleDeleteGuest,
}) => {
  // Retorna null se editGuest não estiver definido
  if (!editGuest) return null;

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
          <div className="modal-body">
            <form onSubmit={handleUpdateGuest}>
              {/* Seleção do Tipo de Hóspede */}
              <div className="mb-3 row">
                <label htmlFor="editGuestType" className="col-sm-3 col-form-label">
                  Tipo
                </label>
                <div className="col-sm-9">
                  <select
                    id="editGuestType"
                    className="form-select form-select-sm"
                    value={editGuest.type || ''}
                    onChange={(e) =>
                      setEditGuest({ ...editGuest, type: e.target.value })
                    }
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
                <label htmlFor="editGuestName" className="col-sm-3 col-form-label">
                  Nome
                </label>
                <div className="col-sm-9">
                  <input
                    id="editGuestName"
                    type="text"
                    className="form-control"
                    placeholder="Nome"
                    value={editGuest.name || ''}
                    onChange={(e) =>
                      setEditGuest({ ...editGuest, name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Input para CPF/CNPJ do Hóspede */}
              <div className="mb-3 row">
                <label htmlFor="editGuestCPF" className="col-sm-3 col-form-label">
                  {editGuest.type === 'fisica' ? 'CPF' : 'CNPJ'}
                </label>
                <div className="col-sm-9">
                  <input
                    id="editGuestCPF"
                    type="text"
                    className="form-control"
                    placeholder={editGuest.type === 'fisica' ? 'CPF' : 'CNPJ'}
                    value={editGuest.cpf_cnpj || ''}
                    onChange={(e) =>
                      setEditGuest({ ...editGuest, cpf_cnpj: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Input para Nome Fantasia (apenas para tipo juridica) */}
              {editGuest.type === 'juridica' && (
                <div className="mb-3 row">
                  <label
                    htmlFor="editGuestFantasyName"
                    className="col-sm-3 col-form-label"
                  >
                    Fantasia
                  </label>
                  <div className="col-sm-9">
                    <input
                      id="editGuestFantasyName"
                      type="text"
                      className="form-control"
                      placeholder="Nome Fantasia"
                      value={editGuest.nome_fantasia || ''}
                      onChange={(e) =>
                        setEditGuest({
                          ...editGuest,
                          nome_fantasia: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <hr />

              {/* Inputs para Endereço do Hóspede */}

{/* Estado */}
<div className="mb-3 row">
  <label htmlFor="editGuestEstado" className="col-sm-3 col-form-label">
    Estado
  </label>
  <div className="col-sm-9">
    <select
      id="editGuestEstado"
      className="form-select"
      value={editGuest.address?.estado || ""}
      onChange={(e) =>
        setEditGuest({
          ...editGuest,
          address: {
            ...editGuest.address,
            estado: e.target.value,
          },
        })
      }
      required
    >
      <option value="" disabled>
        Selecione um Estado
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

{/* Outros Campos de Endereço */}
{["cidade", "bairro", "rua", "numero", "cep"].map((field) => (
  <div key={field} className="mb-3 row">
    <label htmlFor={`editGuest${field}`} className="col-sm-3 col-form-label">
      {field[0].toUpperCase() + field.slice(1)}
    </label>
    <div className="col-sm-9">
      <input
        id={`editGuest${field}`}
        type="text"
        className="form-control"
        placeholder={field[0].toUpperCase() + field.slice(1)}
        value={editGuest.address?.[field] || ""}
        onChange={(e) =>
          setEditGuest({
            ...editGuest,
            address: {
              ...editGuest.address,
              [field]: e.target.value,
            },
          })
        }
        required
      />
    </div>
  </div>
))}


              <div className="modal-footer d-flex justify-content-between">
                {/* Botão para Excluir Hóspede */}
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    Swal.fire({
                      title: "Tem certeza?",
                      text: "Esta ação não poderá ser desfeita",
                      showCancelButton: true,
                      confirmButtonColor: "#d33",
                      cancelButtonColor: "#0099c6",
                      confirmButtonText: "Sim",
                      cancelButtonText: "Cancelar",
                    }).then((result) => {
                      if (result.isConfirmed) {
                        handleDeleteGuest(editGuest.id);
                      }
                    });
                  }}
                >
                  Excluir
                </button>
                <div>
                  {/* Botão para Cancelar Edição */}
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancelar
                  </button>
                  {/* Botão para Salvar Alterações */}
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditGuestModal;
