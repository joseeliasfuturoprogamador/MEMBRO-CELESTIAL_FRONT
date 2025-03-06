import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, Select, VStack, HStack, IconButton } from "@chakra-ui/react";
import { FaSave, FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";

const fieldPlaceholders = {
  nome: "Digite o nome completo",
  nascimento: "Selecione a data de nascimento",
  endereco: "Digite o endereço",
  bairro: "Digite o bairro",
  filiacao: "Digite a filiação (Pai/Mãe)",
  estadocivil: "Selecione o estado civil",
  cpf: "Digite o CPF",
  area: "Digite a área de atuação",
  congregacao: "Digite a congregação",
  dirigente: "Digite o nome do dirigente",
  conversao: "Selecione a data da conversão",
  funcao: "Digite a função",
  discipulado: "Selecione se fez discipulado",
  batismo: "Selecione a data do batismo",
};

const ModalComp = ({ isOpen, onClose, dataEdit = {}, loadUsers }) => {
  const [form, setForm] = useState(() => ({
    ...Object.fromEntries(Object.keys(fieldPlaceholders).map(field => [field, '']))
  }));

  useEffect(() => {
    if (dataEdit && dataEdit._id) {
      setForm({
        ...Object.fromEntries(
          Object.keys(fieldPlaceholders).map(field => {
            if (field === "nascimento" || field === "batismo" || field === "conversao") {
              // Converter a data para o formato YYYY-MM-DD ao editar
              return [field, dataEdit[field] ? dataEdit[field].split('T')[0] : ''];
            }
            return [field, dataEdit[field] || ''];
          })
        )
      });
    }
  }, [dataEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!form.nome || !form.cpf || !form.nascimento || !form.batismo) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
  
    // Validação de data de nascimento
    const nascimentoDate = new Date(form.nascimento);
    if (isNaN(nascimentoDate.getTime())) {
      alert("A data de nascimento não é válida.");
      return;
    }
  
    // Validação de data de batismo
    const batismoDate = new Date(form.batismo);
    if (isNaN(batismoDate.getTime())) {
      alert("A data de batismo não é válida.");
      return;
    }
  
    // Validação de data de conversão (verificando se existe)
    const conversaoDate = form.conversao ? new Date(form.conversao) : null;
    if (conversaoDate && isNaN(conversaoDate.getTime())) {
      alert("A data de conversão não é válida.");
      return;
    }
  
    // Convertendo as datas para o formato correto YYYY-MM-DD
    const dataNascimento = nascimentoDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const dataBatismo = batismoDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const dataConversao = conversaoDate ? conversaoDate.toISOString().split('T')[0] : null;
  
    // Atualizando o form com as datas convertidas
    const formData = {
      ...form,
      nascimento: dataNascimento,
      batismo: dataBatismo,
      conversao: dataConversao,
    };
  
    try {
      const url = dataEdit._id ? `http://localhost:3000/api/users/${dataEdit._id}` : "http://localhost:3000/api/users";
      const method = dataEdit._id ? axios.put : axios.post;
  
      // Verifique se os dados estão sendo passados corretamente
      console.log("Enviando dados:", formData);
  
      await method(url, formData);
  
      loadUsers();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error.response || error);
      alert(`Erro: ${error.response?.data?.message || error.message || 'Erro desconhecido'}`);
      alert("Houve um erro ao salvar o membro. Tente novamente.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent borderRadius="lg" borderWidth="1px" boxShadow="xl">
        <ModalHeader bg="blue.600" color="white" textAlign="center">
          {dataEdit._id ? "Editar Membro" : "Novo Cadastro de Membro"}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody p={5} bg="gray.50">
          <VStack spacing={3}>
            {Object.keys(form).map((field) => (
              <FormControl key={field}>
                <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </FormLabel>
                {field === "nascimento" || field === "batismo" || field === "conversao" ? (
                  <Input
                    name={field}
                    type="date"
                    value={form[field]}
                    onChange={handleChange}
                    placeholder={fieldPlaceholders[field]}
                  />
                ) : ['estadocivil', 'discipulado'].includes(field) ? (
                  <Select name={field} value={form[field]} onChange={handleChange} placeholder={fieldPlaceholders[field]}>
                    {(field === "estadocivil" ? ["Solteiro(a)", "Casado(a)", "Viúvo", "Divorciado"] : ["Sim Fiz", "Não Fiz"]).map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Select>
                ) : (
                  <Input name={field} value={form[field]} onChange={handleChange} placeholder={fieldPlaceholders[field]} />
                )}
              </FormControl>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter bg="gray.100">
          <HStack spacing={4} w="100%" justify="space-between">
            <IconButton icon={<FaSave />} aria-label="Salvar" colorScheme="blue" onClick={handleSave} />
            <IconButton icon={<FaTimes />} aria-label="Cancelar" colorScheme="red" onClick={onClose} />
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalComp;
