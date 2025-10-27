import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  IconButton,
  useToast,
  Box,
  Grid,
  GridItem,
} from "@chakra-ui/react";
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

// ✅ Usando variável de ambiente Vite
const API_URL = import.meta.env.VITE_API_URL;

const ModalComp = ({ isOpen, onClose, dataEdit = {}, data, setData, loadUsers }) => {
  const [form, setForm] = useState(() =>
    Object.fromEntries(Object.keys(fieldPlaceholders).map((field) => [field, ""]))
  );

  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      if (dataEdit && dataEdit._id) {
        setForm(
          Object.fromEntries(
            Object.keys(fieldPlaceholders).map((field) => {
              if (["nascimento", "batismo", "conversao"].includes(field)) {
                return [field, dataEdit[field] ? dataEdit[field].split("T")[0] : ""];
              }
              return [field, dataEdit[field] || ""];
            })
          )
        );
      } else {
        setForm(
          Object.fromEntries(Object.keys(fieldPlaceholders).map((field) => [field, ""]))
        );
      }
    }
  }, [dataEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!form.nome || !form.cpf || !form.nascimento || !form.batismo) {
      toast({
        title: "Campos obrigatórios incompletos.",
        description: "Preencha nome, CPF, nascimento e batismo.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const nascimentoDate = new Date(form.nascimento);
    const batismoDate = new Date(form.batismo);
    const conversaoDate = form.conversao ? new Date(form.conversao) : null;

    const dataNascimento = nascimentoDate.toISOString().split("T")[0];
    const dataBatismo = batismoDate.toISOString().split("T")[0];
    const dataConversao = conversaoDate ? conversaoDate.toISOString().split("T")[0] : null;

    const igrejaId = sessionStorage.getItem("idIgreja");
    if (!igrejaId) {
      toast({
        title: "Erro ao identificar a igreja.",
        description: "ID da igreja não encontrado na sessão.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const formData = {
      ...form,
      nascimento: dataNascimento,
      batismo: dataBatismo,
      conversao: dataConversao,
      igreja: igrejaId,
    };

    try {
      const isEdit = dataEdit && dataEdit._id;
      const url = isEdit
        ? `${API_URL}/api/users/${dataEdit._id}`
        : `${API_URL}/api/users`;

      const method = isEdit ? axios.put : axios.post;

      const response = await method(url, formData, {
        headers: {
          "Content-Type": "application/json",
          "X-Igreja-Id": igrejaId,
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast({
          title: isEdit ? "Membro atualizado!" : "Membro cadastrado!",
          description: isEdit
            ? "As informações foram atualizadas com sucesso."
            : "Novo membro cadastrado com sucesso.",
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top",
        });

        if (isEdit) {
          setData((prev) =>
            prev.map((m) => (m._id === dataEdit._id ? response.data : m))
          );
        } else {
          setData((prev) => [...prev, response.data]);
        }

        if (typeof loadUsers === "function") {
          await loadUsers();
        }

        onClose();
      } else {
        toast({
          title: "Erro ao salvar.",
          description: "Tente novamente mais tarde.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar membro:", error.response || error);
      toast({
        title: "Erro ao salvar membro.",
        description: error.response?.data?.message || error.message || "Erro desconhecido.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent borderRadius="lg" borderWidth="1px" boxShadow="xl">
        <ModalHeader bg="blue.600" color="white" textAlign="center">
          {dataEdit._id ? "Editar Membro" : "Novo Cadastro de Membro"}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody p={6} bg="gray.50">
          <Box>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={6}
              justifyItems="start"
              alignItems="start"
            >
              {Object.keys(form).map((field) => (
                <GridItem key={field}>
                  <FormControl>
                    <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </FormLabel>
                    {["nascimento", "batismo", "conversao"].includes(field) ? (
                      <Input
                        name={field}
                        type="date"
                        value={form[field]}
                        onChange={handleChange}
                        placeholder={fieldPlaceholders[field]}
                        size="lg"
                        borderRadius="md"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                      />
                    ) : ["estadocivil", "discipulado"].includes(field) ? (
                      <Select
                        name={field}
                        value={form[field]}
                        onChange={handleChange}
                        placeholder={fieldPlaceholders[field]}
                        size="lg"
                        borderRadius="md"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                      >
                        {(field === "estadocivil"
                          ? ["Solteiro(a)", "Casado(a)", "Viúvo", "Divorciado"]
                          : ["Sim Fiz", "Não Fiz"]
                        ).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        name={field}
                        value={form[field]}
                        onChange={handleChange}
                        placeholder={fieldPlaceholders[field]}
                        size="lg"
                        borderRadius="md"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                      />
                    )}
                  </FormControl>
                </GridItem>
              ))}
            </Grid>
          </Box>
        </ModalBody>
        <ModalFooter bg="gray.100">
          <HStack spacing={4} w="100%" justify="space-between">
            <IconButton
              icon={<FaSave />}
              aria-label="Salvar"
              colorScheme="blue"
              size="lg"
              onClick={handleSave}
              borderRadius="full"
              boxShadow="md"
            />
            <IconButton
              icon={<FaTimes />}
              aria-label="Cancelar"
              colorScheme="red"
              size="lg"
              onClick={onClose}
              borderRadius="full"
              boxShadow="md"
            />
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalComp;
