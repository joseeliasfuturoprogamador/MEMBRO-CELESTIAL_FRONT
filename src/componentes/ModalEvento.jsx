import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  Stack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ModalEvento = ({ isOpen, onClose, eventoEdicao, carregarEventos }) => {
  const toast = useToast();
  const idIgreja = sessionStorage.getItem("idIgreja");

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    dataEvento: "",
    horaEvento: "",
    local: "",
    tipo: "Culto",
  });

  // 🔹 Preencher formulário ao editar
  useEffect(() => {
    if (eventoEdicao) {
      setForm({
        nome: eventoEdicao.nome || "",
        descricao: eventoEdicao.descricao || "",
        dataEvento: eventoEdicao.dataEvento?.substring(0, 10) || "",
        horaEvento: eventoEdicao.horaEvento || "",
        local: eventoEdicao.local || "",
        tipo: eventoEdicao.tipo || "Culto",
      });
    } else {
      setForm({
        nome: "",
        descricao: "",
        dataEvento: "",
        horaEvento: "",
        local: "",
        tipo: "Culto",
      });
    }
  }, [eventoEdicao]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const salvarEvento = async () => {
    if (!form.nome || !form.dataEvento || !form.horaEvento || !form.local) {
      toast({
        title: "Preencha todos os campos obrigatórios",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (eventoEdicao) {
        await axios.put(
          `${API_URL}/api/eventos/${eventoEdicao._id}`,
          form,
          {
            headers: { "X-Igreja-Id": idIgreja },
          }
        );

        toast({
          title: "Evento atualizado com sucesso",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post(`${API_URL}/api/eventos`, form, {
          headers: { "X-Igreja-Id": idIgreja },
        });

        toast({
          title: "Evento criado com sucesso",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      carregarEventos();
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar evento",
        description:
          error.response?.data?.message || "Erro no servidor",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "lg" }}>
      <ModalOverlay />
      <ModalContent borderRadius={{ base: "0", md: "xl" }}>
        <ModalHeader textAlign="center">
          {eventoEdicao ? "Editar Evento" : "Novo Evento"}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody px={{ base: 4, md: 6 }}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Nome do Evento</FormLabel>
              <Input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                size="lg"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Descrição</FormLabel>
              <Textarea
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                resize="none"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Data</FormLabel>
              <Input
                type="date"
                name="dataEvento"
                value={form.dataEvento}
                onChange={handleChange}
                size="lg"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Hora</FormLabel>
              <Input
                type="time"
                name="horaEvento"
                value={form.horaEvento}
                onChange={handleChange}
                size="lg"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Local</FormLabel>
              <Input
                name="local"
                value={form.local}
                onChange={handleChange}
                size="lg"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Tipo</FormLabel>
              <Select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                size="lg"
              >
                <option value="Culto">Culto</option>
                <option value="Vigília">Vigília</option>
                <option value="Congresso">Congresso</option>
                <option value="Ensaio">Ensaio</option>
                <option value="Reunião">Reunião</option>
                <option value="Outro">Outro</option>
              </Select>
            </FormControl>
          </Stack>
        </ModalBody>

        <ModalFooter
          flexDirection={{ base: "column", md: "row" }}
          gap={3}
        >
          <Button
            w={{ base: "100%", md: "auto" }}
            variant="ghost"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            w={{ base: "100%", md: "auto" }}
            colorScheme="blue"
            onClick={salvarEvento}
          >
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalEvento;
``