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

const API_URL = import.meta.env.VITE_API_URL;

const ModalComp = ({ isOpen, onClose, dataEdit = {}, data, setData, loadUsers }) => {
  const [form, setForm] = useState(
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
        setForm(Object.fromEntries(Object.keys(fieldPlaceholders).map((field) => [field, ""])));
      }
    }
  }, [dataEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

    const formData = {
      ...form,
      nascimento: nascimentoDate.toISOString().split("T")[0],
      batismo: batismoDate.toISOString().split("T")[0],
      conversao: conversaoDate ? conversaoDate.toISOString().split("T")[0] : null,
      igreja: sessionStorage.getItem("idIgreja"),
    };

    try {
      const isEdit = dataEdit && dataEdit._id;
      const url = isEdit ? `${API_URL}/api/users/${dataEdit._id}` : `${API_URL}/api/users`;
      const method = isEdit ? axios.put : axios.post;

      const response = await method(url, formData, {
        headers: { "Content-Type": "application/json", "X-Igreja-Id": formData.igreja },
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
          setData((prev) => prev.map((m) => (m._id === dataEdit._id ? response.data : m)));
        } else {
          setData((prev) => [...prev, response.data]);
        }

        if (typeof loadUsers === "function") await loadUsers();
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
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" closeOnOverlayClick={false}>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent borderRadius="xl" border="1px solid #CBD5E0" boxShadow="2xl" overflow="hidden">
        <ModalHeader
          bgGradient="linear(to-r, blue.600, blue.400)"
          color="white"
          textAlign="center"
          fontSize="xl"
          fontWeight="bold"
          py={4}
        >
          {dataEdit._id ? "Editar Membro" : "Novo Cadastro de Membro"}
        </ModalHeader>
        <ModalCloseButton color="white" _hover={{ bg: "red.500" }} />

        <ModalBody bg="gray.50" p={6}>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap={6}
            justifyItems="start"
            alignItems="start"
          >
            {Object.keys(form).map((field) => (
              <GridItem key={field}>
                <FormControl>
                  <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </FormLabel>
                  {["nascimento", "batismo", "conversao"].includes(field) ? (
                    <Input
                      name={field}
                      type="date"
                      value={form[field]}
                      onChange={handleChange}
                      placeholder={fieldPlaceholders[field]}
                      size="md"
                      borderRadius="lg"
                      borderColor="gray.300"
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182CE" }}
                    />
                  ) : ["estadocivil", "discipulado"].includes(field) ? (
                    <Select
                      name={field}
                      value={form[field]}
                      onChange={handleChange}
                      placeholder={fieldPlaceholders[field]}
                      size="md"
                      borderRadius="lg"
                      borderColor="gray.300"
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182CE" }}
                    >
                      {(field === "estadocivil"
                        ? ["Solteiro(a)", "Casado(a)", "Viúvo(a)", "Divorciado(a)"]
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
                      size="md"
                      borderRadius="lg"
                      borderColor="gray.300"
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182CE" }}
                    />
                  )}
                </FormControl>
              </GridItem>
            ))}
          </Grid>
        </ModalBody>

        <ModalFooter bg="gray.100" py={4}>
          <HStack spacing={4} w="100%" justify="flex-end">
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