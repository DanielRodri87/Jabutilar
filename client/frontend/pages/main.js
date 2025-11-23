import { useState, useEffect, useRef } from 'react';
import {
  FiSettings, FiBell, FiUser, FiPlus,
  FiCheck, FiEdit3, FiTrash2, FiCalendar,
  FiAlignLeft, FiCheckSquare, FiAlertCircle,
  FiTag, FiDollarSign, FiChevronDown
} from 'react-icons/fi';

const API_URL = 'http://localhost:8000';

export default function TelaGrupo() {
  // ================= ESTADOS GERAIS =================
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Listas de dados
  const [tarefas, setTarefas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [contasDetalhadas, setContasDetalhadas] = useState([]);

  // Dashboard
  const [contas, setContas] = useState([
    { id: 1, nome: 'Energia', valor: 0, cor: '#E4A87B' },
    { id: 2, nome: 'Água', valor: 0, cor: '#A0BF9F' },
    { id: 3, nome: 'Internet', valor: 0, cor: '#8B5CF6' },
    { id: 4, nome: 'Aluguel', valor: 0, cor: '#92B6E4' },
    { id: 5, nome: 'Alimentação', valor: 0, cor: '#10B981' },
    { id: 7, nome: 'Limpeza', valor: 0, cor: '#EC4899' },
    { id: 6, nome: 'Outros', valor: 0, cor: '#9BBFC0' },
  ]);
  const totalContas = contas.reduce((acc, c) => acc + c.valor, 0);

  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef(null);

  // === ESTADOS DO PERFIL E AVATAR (MODIFICADO) ===
  const [userIdDebug, setUserIdDebug] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({ name: 'Jabuti de lago', image: '/p1.png' });
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // === REDIMENSIONAMENTO DE COLUNAS ===
  const [columnWidths, setColumnWidths] = useState({
    tarefas: [50, 220, 130, 110, 120, 70],
    compras: [50, 200, 110, 60, 100, 110, 70], // Check, Prod, Tipo, Qtd, Valor, Prio, Resp
    contas:  [50, 220, 130, 100, 120, 120, 70],
  });
  const isResizing = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const animationFrame = useRef(null);

  const startResize = (e, table, colIndex) => {
    e.preventDefault();
    isResizing.current = { table, colIndex };
    startX.current = e.clientX;
    startWidth.current = columnWidths[table][colIndex];
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isResizing.current) return;
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      animationFrame.current = requestAnimationFrame(() => {
        const { table, colIndex } = isResizing.current;
        const diff = e.clientX - startX.current;
        const newWidth = Math.max(40, startWidth.current + diff);
        const maxWidth = table === 'tarefas' ? 300 : 280;
        setColumnWidths(prev => ({
          ...prev,
          [table]: prev[table].map((w, i) =>
            i === colIndex ? Math.min(newWidth, maxWidth) : w
          )
        }));
      });
    };
    const handlePointerUp = () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      isResizing.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
    };
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [columnWidths]);

  // === REMOÇÃO COM ANIMAÇÃO SUAVE ===
  const [removingTaskId, setRemovingTaskId] = useState(null);
  const [removingCompraId, setRemovingCompraId] = useState(null);
  const [removingContaId, setRemovingContaId] = useState(null);

  // ================== FETCH DE DADOS ==================

  useEffect(() => {
    if (selectedGroup && selectedGroup.id) {
      // sempre que o grupo muda, zera listas antigas para não "vazar" dados
      setTarefas([]);
      setCompras([]);
      setContasDetalhadas([]);
      // zera o dashboard imediatamente
      calcularDashboard();

      fetchTarefas(selectedGroup.id);
      fetchCompras(selectedGroup.id);
      fetchContas(selectedGroup.id);
    } else {
      // se não houver grupo selecionado, limpa tudo
      setTarefas([]);
      setCompras([]);
      setContasDetalhadas([]);
      // zera dashboard quando não há grupo
      calcularDashboard();
    }
  }, [selectedGroup]);

  // recalcular dashboard quando listas mudarem OU quando o grupo mudar
  useEffect(() => {
    if (!selectedGroup) return;
    calcularDashboard();
  }, [compras, contasDetalhadas, selectedGroup]);

  // ================== DETECÇÃO DE LOGIN SOCIAL / AVATAR (NOVO) ==================
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Verificar se deve mostrar o seletor de perfil (vindo do callback do Facebook ou flag de URL)
    const params = new URLSearchParams(window.location.search);
    const isNew = params.get('new') === 'true';
    const storageShow = sessionStorage.getItem('show_profile_selector') === 'true';
    
    // Se for novo login OU se a imagem atual for a padrão genérica
    if (isNew || storageShow || (userProfile.image === '/fotodeperfil.png')) {
        setShowAvatarModal(true);
        // Limpar a flag para não mostrar novamente no refresh
        sessionStorage.removeItem('show_profile_selector');
        
        // Limpar a query string 'new=true' da URL sem recarregar a página
        if (isNew) {
            const newUrl = window.location.pathname + window.location.search.replace(/[\?&]new=true/, '');
            window.history.replaceState({}, '', newUrl);
        }
    }
  }, [userProfile.image]); // Dependência na imagem atual

  // Função para salvar o avatar escolhido
  const handleSelectAvatar = async (avatarUrl) => {
    // 1. Atualizar estado visual imediato (Feedback Rápido)
    setUserProfile(prev => ({ ...prev, image: avatarUrl }));
    setShowAvatarModal(false);

    try {
        // 2. Persistir localmente
        const extra = JSON.parse(sessionStorage.getItem('user_extra') || '{}');
        extra.image = avatarUrl;
        
        const extraString = JSON.stringify(extra);
        sessionStorage.setItem('user_extra', extraString);
        localStorage.setItem('user_extra', extraString);
        
        // 3. SALVAR NO BACKEND (A Correção Principal)
        if (userIdDebug) {
            const response = await fetch(`${API_URL}/usuario/${userIdDebug}/avatar`, {
                method: 'PATCH', // Usando PATCH pois é uma atualização parcial
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ image: avatarUrl })
            });

            if (!response.ok) {
                console.error("Erro ao salvar avatar no servidor:", await response.text());
            } else {
                console.log("Avatar salvo com sucesso no banco de dados.");
            }
        }

    } catch (e) {
        console.error("Erro ao processar a escolha do avatar", e);
    }
  };

  const fetchTarefas = async (groupId) => {
    try {
      // filtra tarefas pelo grupo atual
      const res = await fetch(`${API_URL}/tarefa?id_group=${groupId}`);
      const data = await res.json();
      if (data.data) {
        // filtro de segurança no frontend caso o backend ainda retorne outras tarefas
        const onlyCurrentGroup = data.data.filter(t => {
          // o backend salva em group_id; alguns clients antigos podem ter grupo_id
          const gid = t.group_id ?? t.grupo_id;
          return Number(gid) === Number(groupId);
        });

        const mapped = onlyCurrentGroup.map(t => ({
          id: t.id,
          descricao: t.titulo,
          status: t.status ? 'Concluída' : 'Não começou',
          checked: t.status,
          prioridade: mapPriorityToString(t.prioridade),
          data: t.datavencimento,
          responsavel: '/p1.png',
          editing: false
        }));
        setTarefas(mapped);
      } else {
        setTarefas([]);
      }
    } catch (e) { console.error("Erro tarefas", e); }
  };

  const fetchCompras = async (groupId) => {
    try {
      const res = await fetch(`${API_URL}/itens-compra?id_list=${groupId}`);
      const data = await res.json();
      if (data.data) {
        const mapped = data.data.map(c => ({
          id: c.id,
          produto: c.nome,
          tipo: c.categoria || 'Outros',
          valor: c.preco,
          quantidade: c.quantidade || 1, 
          checked: c.comprado,
          prioridade: 'Média',
          responsavel: '/p1.png',
          editing: false
        }));
        setCompras(mapped);
      }
    } catch (e) { console.error("Erro compras", e); }
  };

  const fetchContas = async (groupId) => {
    try {
      const res = await fetch(`${API_URL}/conta/${groupId}`);
      const data = await res.json();
      if (data.data) {
        const mapped = data.data.map(c => ({
          id: c.id,
          descricao: c.descricao,
          valor: c.valor,
          datavencimento: c.datavenc,
          status: c.status,
          categoria: c.categoria,
          recorrente: c.recorrente,
          responsavel: '/p1.png',
          editing: false
        }));
        setContasDetalhadas(mapped);
      }
    } catch (e) { console.error("Erro contas", e); }
  };

  // ================== LÓGICA DO DASHBOARD ==================
  const calcularDashboard = () => {
    const categoriasMap = {
      'Energia': { id: 1, cor: '#F59E0B', valor: 0 },
      'Água': { id: 2, cor: '#3B82F6', valor: 0 },
      'Internet': { id: 3, cor: '#8B5CF6', valor: 0 },
      'Aluguel': { id: 4, cor: '#EF4444', valor: 0 },
      'Alimentação': { id: 5, cor: '#10B981', valor: 0 },
      'Limpeza': { id: 7, cor: '#EC4899', valor: 0 },
      'Outros': { id: 6, cor: '#9CA3AF', valor: 0 },
    };

    // Somar Contas
    contasDetalhadas.forEach(c => {
      let cat = c.categoria || 'Outros';
      if (!categoriasMap[cat]) cat = 'Outros';
      categoriasMap[cat].valor += Number(c.valor || 0);
    });

    // Somar Compras (Valor * Quantidade)
    compras.forEach(c => {
      let cat = c.tipo || 'Outros';
      if (cat === 'Comida') cat = 'Alimentação';
      if (!categoriasMap[cat]) cat = 'Outros';
      
      const totalItem = Number(c.valor || 0) * Number(c.quantidade || 1);
      categoriasMap[cat].valor += totalItem;
    });

    const novoDashboard = Object.keys(categoriasMap).map(key => ({
      id: categoriasMap[key].id,
      nome: key,
      valor: categoriasMap[key].valor,
      cor: categoriasMap[key].cor
    }));

    setContas(novoDashboard);
  };

  // ================== CHECK & DELETE LOGIC ==================

  const handleTaskCheck = async (task) => {
    if (!task.checked) {
      const updatedTask = { ...task, checked: true, status: 'Concluída' };
      setTarefas(prev => prev.map(t => t.id === task.id ? updatedTask : t));
      try {
        await fetch(`${API_URL}/tarefa/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: task.descricao,
            descricao: task.descricao,
            datavencimento: task.data,
            prioridade: mapPriorityToInt(task.prioridade),
            status: true,
            recorrente: false,
            responsavel: 1,
            grupo_id: Number(selectedGroup.id)   // garantir vínculo ao marcar concluída
          })
        });
      } catch(e) { console.error(e); }
    } else {
      setTarefas(prev => prev.map(t => t.id === task.id ? { ...t, checked: false, status: 'Não começou' } : t));
      setRemovingTaskId(task.id);
      setTimeout(async () => {
        try {
          await fetch(`${API_URL}/tarefa/${task.id}`, { method: 'DELETE' });
          setTarefas(prev => prev.filter(t => t.id !== task.id));
        } catch(e) { console.error(e); }
        setRemovingTaskId(null);
      }, 500);
    }
  };

  const handleCompraCheck = async (compra) => {
    if (!compra.checked) {
      setCompras(prev => prev.map(c => c.id === compra.id ? { ...c, checked: true } : c));
      try {
        await fetch(`${API_URL}/itens-compra/${compra.id}/comprado?comprado=true`, { method: 'PATCH' });
      } catch(e) { console.error(e); }
    } else {
      setCompras(prev => prev.map(c => c.id === compra.id ? { ...c, checked: false } : c));
      setRemovingCompraId(compra.id);
      setTimeout(async () => {
        try {
          await fetch(`${API_URL}/itens-compra/${compra.id}`, { method: 'DELETE' });
          setCompras(prev => prev.filter(c => c.id !== compra.id));
        } catch(e) { console.error(e); }
        setRemovingCompraId(null);
      }, 500);
    }
  };

  const handleContaCheck = async (conta) => {
    if (!conta.status) {
      setContasDetalhadas(prev => prev.map(c => c.id === conta.id ? { ...c, status: true } : c));
      try {
        await fetch(`${API_URL}/conta/${conta.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            descricao: conta.descricao,
            valor: conta.valor,
            datavencimento: conta.datavencimento,
            status: true,
            categoria: conta.categoria,
            recorrente: conta.recorrente,
            resp: 1,
            grupo_id: Number(selectedGroup.id)
          })
        });
      } catch(e) { console.error(e); }
    } else {
      setContasDetalhadas(prev => prev.map(c => c.id === conta.id ? { ...c, status: false } : c));
      setRemovingContaId(conta.id);
      setTimeout(async () => {
        try {
          await fetch(`${API_URL}/conta/${conta.id}`, { method: 'DELETE' });
          setContasDetalhadas(prev => prev.filter(c => c.id !== conta.id));
        } catch(e) { console.error(e); }
        setRemovingContaId(null);
      }, 500);
    }
  };

  // ================== CRUD CREATE/UPDATE ==================

  const addTask = async () => {
    if (!selectedGroup) return;
    try {
      const res = await fetch(`${API_URL}/tarefa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: 'Nova Tarefa',
          descricao: 'Nova Tarefa',
          datavencimento: new Date().toISOString().split('T')[0],
          prioridade: 2,
          status: false,
          recorrente: false,
          responsavel: 1,
          grupo_id: Number(selectedGroup.id)      // << referenciar grupo
        })
      });
      const data = await res.json();
      if (!res.ok) { alert('Erro ao criar tarefa'); return; }
      if (data.data) {
        const t = data.data;
        setTarefas(prev => [...prev, {
          id: t.id,
          descricao: t.titulo,
          status: '',
          prioridade: 'Média',
          data: t.datavencimento,
          responsavel: '/p1.png',
          editing: true,
          checked: false
        }]);
        setEditingTask(t.id);
      }
    } catch(e) { console.error(e); }
  };

  const saveTask = async (id) => {
    const t = tarefas.find(x => x.id === id);
    if (!t) return;
    setTarefas(prev => prev.map(item => item.id === id ? { ...item, editing: false } : item));
    setEditingTask(null);
    await fetch(`${API_URL}/tarefa/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: t.descricao,
        descricao: t.descricao,
        datavencimento: t.data,
        prioridade: mapPriorityToInt(t.prioridade),
        status: t.checked,
        recorrente: false,
        responsavel: 1,
        grupo_id: Number(selectedGroup.id)      // << manter vínculo ao atualizar
      })
    });
  };

  const addCompra = async () => {
    if (!selectedGroup) return;
    try {
      const res = await fetch(`${API_URL}/itens-compra`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: 'Novo Item',
          quantidade: 1,
          preco: 0,
          categoria: 'Outros',
          comprado: false,
          id_list: Number(selectedGroup.id)
        })
      });
      const data = await res.json();
      if (!res.ok) { alert(`Erro: ${data.detail}`); return; }
      if (data.data) {
        const c = data.data;
        setCompras(prev => [...prev, {
          id: c.id,
          produto: c.nome,
          tipo: 'Outros',
          prioridade: 'Média',
          valor: 0,
          quantidade: 1,
          responsavel: '/p1.png',
          editing: true,
          checked: false
        }]);
        setEditingCompra(c.id);
      }
    } catch(e) { console.error(e); }
  };

  const saveCompra = async (id) => {
    const c = compras.find(x => x.id === id);
    if (!c) return;
    setCompras(prev => prev.map (item => item.id === id ? { ...item, editing: false } : item));
    setEditingCompra(null);
    await fetch(`${API_URL}/itens-compra/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: c.produto,
        quantidade: Number(c.quantidade || 1),
        preco: Number(c.valor || 0),
        categoria: c.tipo,
        comprado: c.checked,
        id_list: Number(selectedGroup.id)
      })
    });
  };

  const addContaDetalhada = async () => {
    if (!selectedGroup) return;
    try {
      const res = await fetch(`${API_URL}/conta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descricao: 'Nova Conta',
          valor: 0,
          datavencimento: new Date().toISOString().split('T')[0],
          status: false,
          categoria: 'Outros',
          recorrente: false,
          resp: 1,
          grupo_id: Number(selectedGroup.id)
        })
      });
      const data = await res.json();
      if (!res.ok) { alert(`Erro: ${data.detail}`); return; }
      if (data.data) {
        const c = data.data;
        setContasDetalhadas(prev => [...prev, {
          id: c.id,
          status: false,
          descricao: c.descricao,
          categoria: 'Outros',
          valor: 0,
          datavencimento: c.datavenc,
          recorrente: false,
          responsavel: '/p1.png',
          editing: true
        }]);
        setEditingConta(c.id);
      }
    } catch(e) { console.error(e); }
  };

  const saveContaDetalhada = async (id) => {
    const c = contasDetalhadas.find(x => x.id === id);
    if (!c) return;
    setContasDetalhadas(prev => prev.map(item => item.id === id ? { ...item, editing: false } : item));
    setEditingConta(null);
    await fetch(`${API_URL}/conta/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descricao: c.descricao,
        valor: c.valor,
        datavencimento: c.datavencimento,
        status: c.status,
        categoria: c.categoria,
        recorrente: c.recorrente,
        resp: 1,
        grupo_id: Number(selectedGroup.id)
      })
    });
  };

  const deleteTask = async (id) => {
    await fetch(`${API_URL}/tarefa/${id}`, { method: 'DELETE' });
    setTarefas(prev => prev.filter(t => t.id !== id));
  };
  const deleteCompra = async (id) => {
    await fetch(`${API_URL}/itens-compra/${id}`, { method: 'DELETE' });
    setCompras(prev => prev.filter(c => c.id !== id));
  };
  const deleteContaDetalhada = async (id) => {
    await fetch(`${API_URL}/conta/${id}`, { method: 'DELETE' });
    setContasDetalhadas(prev => prev.filter(c => c.id !== id));
  };

  // ================== UTILS E ESTADOS DE UI ==================

  const mapPriorityToString = (p) => (p === 3 ? 'Alta' : p === 1 ? 'Baixa' : 'Média');
  const mapPriorityToInt = (s) => (s === 'Alta' ? 3 : s === 'Baixa' ? 1 : 2);
  const formatCurrency = (v) => (v || v === 0 ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');

  const [showCreateGroup, setShowCreateGroup] = useState(true);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingCompra, setEditingCompra] = useState(null);
  const [editingConta, setEditingConta] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editName, setEditName] = useState('');
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid') || sessionStorage.getItem('user_id') || localStorage.getItem('user_id');
    if(!uid) { setInitialLoading(false); return; }
    setUserIdDebug(uid);
    try {
       const extra = JSON.parse(sessionStorage.getItem('user_extra') || localStorage.getItem('user_extra') || '{}');
       // Se tiver name/image, usa. Se não, usa defaults.
       setUserProfile(prev => ({
           ...prev,
           name: extra.name || prev.name,
           image: extra.image || prev.image
       }));
    } catch(e){}
  }, []);

  useEffect(() => {
    const loadGroup = async () => {
       if(!userIdDebug) { setInitialLoading(false); return; }
       try {
           const uRes = await fetch(`${API_URL}/usuario/${userIdDebug}`);
           if(!uRes.ok) { setInitialLoading(false); return; }
           const uData = await uRes.json();
           const gid = (uData.data || uData).id_group;
           if(!gid) { 
             setShowCreateGroup(true); 
             // novo usuário sem grupo: limpa dados
             setGroups([]);
             setSelectedGroup(null);
             setTarefas([]);
             setCompras([]);
             setContasDetalhadas([]);
             // zera dashboard para o novo usuário
             calcularDashboard();
             setInitialLoading(false); 
             return; 
           }
           const gRes = await fetch(`${API_URL}/grupo/${gid}`);
           const gData = await gRes.json();
           if(gData.data) {
               const g = { id: gData.data.id, name: gData.data.nome, icon: '/planta.png' };
               setGroups([g]); 
               setSelectedGroup(g);
               // ao trocar de grupo via backend (outro usuário/conta), zera as listas
               setTarefas([]);
               setCompras([]);
               setContasDetalhadas([]);
               // zera dashboard para não mostrar dados do usuário anterior
               calcularDashboard();
               setShowCreateGroup(false);
           }
           setInitialLoading(false);
       } catch(e) { 
         console.error(e); 
         setInitialLoading(false); 
       }
    };
    loadGroup();
  }, [userIdDebug]);

  const cycleStatus = (id) => {
    setTarefas(prev => prev.map(t => {
      if(t.id!==id)return t;
      const order=['','Não começou','Em andamento','Concluída'];
      return {...t, status: order[(order.indexOf(t.status)+1)%order.length]};
    }));
  };
  const cyclePrioridade = (id, isTask=true) => {
    const setter = isTask ? setTarefas : setCompras;
    setter(prev => prev.map(i => {
      if(i.id!==id)return i;
      const order=['Baixa','Média','Alta'];
      return {...i, prioridade: order[(order.indexOf(i.prioridade)+1)%order.length]};
    }));
  };
  const cycleTipo = (id) => {
    setCompras(prev => prev.map(c => {
      if(c.id!==id)return c;
      const order=['Outros','Limpeza','Comida'];
      return {...c, tipo: order[(order.indexOf(c.tipo)+1)%order.length]};
    }));
  };
  const cycleCategoriaConta = (id) => {
    setContasDetalhadas(prev => prev.map(c => {
      if(c.id!==id)return c;
      const order=['Energia','Água','Internet','Aluguel','Outros'];
      return {...c, categoria: order[(order.indexOf(c.categoria)+1)%order.length]};
    }));
  };
  const updateCompraValor = (id, val) => {
    const num = parseInt(val.replace(/\D/g,''), 10);
    setCompras(prev => prev.map(c => c.id===id ? {...c, valor: num?(num/100).toFixed(2):''} : c));
  };
  const updateContaDetalhadaValor = (id, val) => {
    const num = parseInt(val.replace(/\D/g,''), 10);
    setContasDetalhadas(prev => prev.map(c => c.id===id ? {...c, valor: num?(num/100):0} : c));
  };
  const updateCompraQuantidade = (id, val) => {
    const num = parseInt(val.replace(/\D/g,''), 10);
    setCompras(prev => prev.map(c => c.id===id ? {...c, quantidade: num || 1} : c));
  };

  const renderDatePicker = (itemId, currentDate, isTask = true) => {
    const date = currentDate ? new Date(currentDate) : new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const setDate = async (dateStr) => {
      if (isTask) {
        setTarefas(prev => prev.map(t => t.id === itemId ? { ...t, data: dateStr } : t));
        const t = tarefas.find(x=>x.id===itemId);
        if(t) await saveTask(t.id);
      } else {
        setContasDetalhadas(prev => prev.map(c => c.id === itemId ? { ...c, datavencimento: dateStr } : c));
        const c = contasDetalhadas.find(x=>x.id===itemId);
        if(c) await saveContaDetalhada(c.id);
      }
      setShowDatePicker(null);
    };

    return (
      <div style={{
        position: 'absolute', top: '100%', left: 0, background: '#fff', border: '1px solid #ddd',
        borderRadius: 12, padding: 12, boxShadow: '0 8px 25px rgba(0,0,0,.12)', zIndex: 100, fontSize: 13
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontWeight: 600, color: '#666' }}>{d}</div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            return (
              <div
                key={day}
                style={{
                  textAlign: 'center', padding: '6px 4px', cursor: 'pointer', borderRadius: 8,
                  background: currentDate === dateStr ? '#C1D9C1' : 'transparent',
                  color: currentDate === dateStr ? '#000' : '#333',
                  fontWeight: currentDate === dateStr ? 600 : 400
                }}
                onClick={() => setDate(dateStr)}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if(!userIdDebug) return;
    try {
        const res = await fetch(`${API_URL}/grupo`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({nome:groupName, descricao:groupDescription, group_owner:userIdDebug})
        });
        const data = await res.json();
        if(!res.ok) { alert(data.detail); return; }
        const g = data.data;
        await fetch(`${API_URL}/usuario/${userIdDebug}/grupo?grupo_id=${g.id}`, {method:'PATCH'});
        const newG = {id: g.id, name: g.nome, icon:'/planta.png'};
        setGroups([newG]); setSelectedGroup(newG); setShowCreateGroup(false); setShowInviteCode(true);
        setGeneratedCode(String(g.cod_convite));
    } catch(e) { console.error(e); }
  };
  const handleJoinWithInvite = async (e) => {
    e.preventDefault();
    if(!inviteCode) return;
    try {
        const res = await fetch(`${API_URL}/grupo/codigo/${inviteCode}`);
        const data = await res.json();
        if(!res.ok) { alert(data.detail); return; }
        const g = data.data;
        await fetch(`${API_URL}/usuario/${userIdDebug}/grupo?grupo_id=${g.id}`, {method:'PATCH'});
        const newG = {id: g.id, name: g.nome, icon:'/planta.png'};
        setGroups([newG]); setSelectedGroup(newG); setShowCreateGroup(false);
    } catch(e){ console.error(e); }
  };
  const closePopups = () => { setShowCreateGroup(false); setShowInviteCode(false); };
  const handleCopy = () => { navigator.clipboard.writeText(generatedCode); setCopied(true); setTimeout(()=>setCopied(false), 5000); };
  const openContextMenu = (e, g) => { e.preventDefault(); setContextMenu({x:e.clientX,y:e.clientY,groupId:g.id}); };
  const startRename = (g) => { setEditingGroupId(g.id); setEditName(g.name); setContextMenu(null); };
  const saveRename = () => { setGroups(p=>p.map(g=>g.id===editingGroupId?{...g,name:editName}:g)); setEditingGroupId(null); };
  const deleteGroup = async () => { 
      await fetch(`${API_URL}/grupo/${contextMenu.groupId}`, {method:'DELETE'});
      setGroups([]); setSelectedGroup(null); setShowCreateGroup(true); setContextMenu(null);
  };

  useEffect(() => {
    const handleScroll = () => mainRef.current && setScrolled(mainRef.current.scrollTop > 0);
    mainRef.current?.addEventListener('scroll', handleScroll);
    return () => mainRef.current?.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    const handleClick = () => { setContextMenu(null); setShowDatePicker(null); };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <>
      <style jsx>{`
        @font-face {font-family:'Airbnb Cereal';src:url('../fonts/AirbnbCereal_W_Lt.otf') format('opentype');font-weight:300;}
        @font-face {font-family:'Airbnb Cereal';src:url('../fonts/AirbnbCereal_W_Md.otf') format('opentype');font-weight:500;}
        @font-face {font-family:'Airbnb Cereal';src:url('../fonts/AirbnbCereal_W_Bd.otf') format('opentype');font-weight:700;}
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#fff;font-family:'Airbnb Cereal',sans-serif;}

        .container{display:flex;height:100vh;background:#fff;}
        .sidebar{width:230px;background:#fff;padding:20px;display:flex;flex-direction:column;border-right:1px solid #e2e2e2;}
        .profile{display:flex;align-items:center;gap:10px;margin-bottom:30px;}
        .profile img{width:40px;height:40px;border-radius:50%;}
        .menu li{list-style:none;margin:10px 0;display:flex;align-items:center;gap:8px;font-weight:500;font-size:15px;color:#333;cursor:pointer;}
        .groups{margin-top:20px;flex:1;}
        .groups p{font-weight:700;font-size:13px;color:#6b7280;margin-bottom:8px;}
        .group-item{display:flex;align-items:center;gap:8px;font-weight:500;font-size:15px;color:#333;cursor:pointer;padding:4px 0;position:relative;}
        .group-item img{width:20px;height:20px;}
        .group-item.active{font-weight:700;color:#000;}
        .group-item span{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500;font-size:15px;}
        .add-group{margin-top:12px;color:#888;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;font-weight:600;font-size:15px;}

        .main{flex:1;overflow-y:auto;position:relative;}
        .fixed-header{position:sticky;top:0;left:0;right:0;z-index:20;background:rgba(255,255,255,.65);backdrop-filter:blur(12px);padding:16px 0;display:flex;align-items:center;gap:12px;transition:all .3s ease;border-bottom:${scrolled ? '1px solid #e2e2e2' : 'none'};}
        .header-content{display:flex;align-items:center;gap:12px;flex:1;padding-left:48px;}
        .header-actions{display:flex;align-items:center;gap:16px;padding-right:48px;}
        .header-actions img{width:18px;height:18px;cursor:pointer;}
        .share-text{font-weight:400;font-size:15px;color:#555;cursor:pointer;}
        .content{padding:32px 48px 48px 48px;}
        .title-section{display:flex;align-items:flex-start;gap:24px;margin-bottom:32px;}
        .title-left{display:flex;flex-direction:column;align-items:flex-start;}
        .plant-large{width:80px;height:80px;margin-bottom:8px;}
        .group-name{font-size:36px;font-weight:700;color:#000;margin:0;}
        .members-line{display:flex;align-items:center;gap:12px;margin-top:8px;font-size:15px;color:#666;}
        .profile-stack{display:flex;align-items:center;}
        .profile-img{width:32px;height:32px;border-radius:50%;border:.5px solid #fff;box-shadow:0 0 0 1px #fff;margin-left:-16px;}
        .profile-img:first-child{margin-left:0;}

        .dashboard{background:#fafafa;border-radius:35px;padding:28px;margin-bottom:28px;box-shadow:0 6px 30px rgba(0,0,0,.12);transition:box-shadow .3s;overflow:hidden;}
        .dashboard:hover{box-shadow:0 12px 40px rgba(160,191,159,.35);}
        .dashboard h3{font-weight:700;font-size:22px;color:#000;opacity:.85;margin-bottom:16px;}

        .total-container{display:flex;flex-direction:column;align-items:flex-start;margin-bottom:18px;}
        .total-value{font-weight:500;font-size:24px;color:#000;line-height:1.2;}
        .total-label{font-weight:300;font-size:14px;color:#000;opacity:.8;margin-top:2px;}
        .bar-container{height:28px;background:#eee;border-radius:14px;overflow:hidden;margin-bottom:24px;}
        .bar{display:flex;height:100%;border-radius:14px;}
        .bar-segment{flex:${totalContas > 0 ? '1 1 0' : '0'};min-width:${totalContas > 0 ? '10px' : '0'};}

        .table-container{width:100%;border-collapse:separate;border-spacing:0;margin-top:8px;table-layout:fixed;overflow:hidden;}
        .table-container thead th{position:relative;padding:14px 10px;text-align:left;font-size:14px;border-bottom:1px solid rgba(0,0,0,.15);overflow:hidden;}
        .table-container tbody td{padding:14px 10px;text-align:left;font-size:14px;border-bottom:1px solid rgba(0,0,0,.15);overflow:hidden;transition:padding .28s ease, opacity .28s ease, transform .28s ease;}
        .table-container td:not(:last-child), .table-container th:not(:last-child){border-right:1px solid rgba(0,0,0,.15);}
        .th-label{display:flex;align-items:center;gap:6px;font-weight:300;font-size:14px;color:#000;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .th-label svg{width:16px;height:16px;opacity:.75;flex-shrink:0;}

        .resize-handle {position: absolute;right: 6px;bottom: 6px;width: 12px;height: 12px;cursor: col-resize;z-index: 1;opacity: 0.25;transition: opacity .2s;}
        .resize-handle:hover {opacity: 0.6;}
        .resize-handle::before, .resize-handle::after {content: '';position: absolute;width: 8px;height: 1px;background: #888;border-radius: 1px;}
        .resize-handle::before {transform: rotate(45deg);top: 4px;left: 2px;}
        .resize-handle::after {transform: rotate(-45deg);top: 7px;left: 2px;}

        .tag-display{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:9999px;font-weight:700;font-size:13px;min-height:28px;cursor:pointer;transition:all .2s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}
        .tag-display svg{width:12px;height:12px;flex-shrink:0;}
        .tag-display.empty{background:#f3f4f6 !important;color:#6b7280 !important;}
        .resp{border-radius:50%;width:24px;height:24px;flex-shrink:0;}
        .add-row{margin-top:16px;color:#888;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;font-weight:600;font-size:15px;}
        .check-circle{width:23px;height:23px;border:2px solid #000;border-radius:50%;cursor:pointer;transition:background .2s;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .check-circle.checked{background:#10B981;border-color:#000;}
        .edit-input{width:100%;border:none;outline:none;font-size:14px;padding:4px 0;background:#fafafa;border-radius:4px;}
        .edit-input:focus{background:#fff;box-shadow:0 0 0 1px #667467;}

        .removing {opacity: 0;transform: translateY(-8px);height: 0 !important;padding-top: 0 !important;padding-bottom: 0 !important;margin: 0 !important;overflow: hidden;}

        .lista-contas{display:grid;grid-template-columns:1fr 1fr;gap:16px 32px;list-style:none;padding:0;}
        .conta-item{display:flex;align-items:center;gap:12px;font-size:14.5px;background:#fafafa;padding:8px 12px;border-radius:12px;}
        .bolinha{width:28px;height:28px;border-radius:50%;flex-shrink:0;}
        .conta-nome{font-weight:600;flex:1;} 
        .conta-input{border:none;outline:none;font-size:14.5px;padding:2px 0;width:100%;background:transparent;font-weight:600;}
        .conta-input:focus{background:#fff;border-radius:4px;box-shadow:0 0 0 1px #667467;}
        .valor-input{text-align:right;font-family:monospace;letter-spacing:0.5px;}

        .overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.65);display:flex;justify-content:center;align-items:center;z-index:1000;}
        .popup-card{width:685px;background:#fafafa;border-radius:35px;box-shadow:0 1px 3px rgba(0,0,0,.1);padding:32px;}
        .popup-title{font-weight:700;font-size:28px;margin-bottom:24px;letter-spacing:-.5px;text-align:center;}
        .popup-form{display:flex;flex-direction:column;gap:16px;}
        .conviteRow{display:flex;align-items:center;gap:10px;}
        .inputWrapper{position:relative;flex:1;}
        .floatingLabel{position:absolute;left:12px;top:8px;font-weight:700;font-size:12px;color:#111827;pointer-events:none;transition:color .16s;}
        .input{width:100%;padding:22px 12px 8px 12px;border:1px solid #d1d5db;border-radius:5px;font-size:14px;outline:none;transition:border-color .16s;}
        .input:focus{border-color:#667467;}
        .inputWrapper:focus-within .floatingLabel{color:#667467;}
        .smallButton{background:transparent;border:1px solid transparent;border-radius:8px;cursor:pointer;padding:12px 18px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;transition:border-color .3s;}
        .smallButton::before{content:"";position:absolute;inset:0;background:#C1D9C1;opacity:1;transition:opacity .3s;z-index:0;}
        .smallButton:hover::before{opacity:.25;}
        .smallButton:hover{border-color:#667467;}
        .smallButton img{width:20px;height:20px;position:relative;z-index:1;}
        .divider{display:flex;align-items:center;justify-content:center;width:100%;margin:24px 0;gap:12px;}
        .dividerLine{flex:1;height:1px;background:#d1d5db;}
        .dividerText{font-size:14px;color:#9ca3af;white-space:nowrap;}
        .submitButton{width:100%;background:transparent;color:#000;font-weight:700;padding:15px 0;border:1px solid transparent;border-radius:8px;cursor:pointer;position:relative;overflow:hidden;transition:border-color .3s;}
        .submitButton::before{content:"";position:absolute;inset:0;background:#C1D9C1;opacity:1;transition:opacity .3s;z-index:0;}
        .submitButton:hover::before{opacity:.21;}
        .submitButton:hover{border-color:#667467;}
        .submitButton span{position:relative;z-index:1;}

        .popup-invite{background:#fff;border-radius:28px;padding:28px;width:90%;max-width:520px;box-shadow:0 20px 60px rgba(0,0,0,.25);}
        .invite-title{font-weight:700;font-size:28px;margin-bottom:20px;letter-spacing:-.5px;text-align:center;color:#111;}
        .codeContainer{display:flex;align-items:center;gap:12px;padding:16px;background:#f9f9f9;border-radius:12px;border:1px solid #e5e7eb;}
        .codeWrapper{flex:1;display:flex;align-items:center;gap:10px;}
        .eyeButton{background:none;border:none;cursor:pointer;padding:6px;border-radius:8px;transition:background .2s;display:flex;align-items:center;justify-content:center;}
        .eyeButton:hover{background:#e5e7eb;}
        .eyeButton img{width:auto;height:24px;object-fit:contain;}
        .eyeButton img.naover{height:25px;}
        .codeDisplay{flex:1;font-family:monospace;font-size:16px;letter-spacing:1.5px;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;user-select:text;}
        .copyButton{background:transparent;border:1px solid transparent;border-radius:8px;cursor:pointer;width:44px;height:44px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;transition:border-color .3s;flex-shrink:0;}
        .copyButton::before{content:"";position:absolute;inset:0;background:#C1D9C1;opacity:1;transition:opacity .3s;z-index:0;}
        .copyButton:hover::before{opacity:.21;}
        .copyButton:hover{border-color:#667467;}
        .copyButton img{width:18px;height:18px;position:relative;z-index:1;transition:opacity .3s;}
        .copyButton.copied img{opacity:0;}
        .copyButton.copied::after{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:18px;height:18px;background:url('/copiado.png') no-repeat center;background-size:contain;z-index:1;}

        .context-menu{position:fixed;background:#fff;border-radius:35px;box-shadow:0 20px 60px rgba(0,0,0,.25);padding:16px 20px;z-index:10000;min-width:180px;border:1px solid rgba(0,0,0,.05);}
        .context-item{display:flex;align-items:center;gap:10px;padding:12px 16px;font-size:14px;font-weight:600;color:#333;cursor:pointer;border-radius:20px;margin-bottom:8px;transition:all .2s;}
        .context-item:hover{background:#f7f7f7;transform:translateY(-2px);}
        .context-item.danger{color:#dc2626;}
        .context-item.danger:hover{background:#fee2e2;}
        .context-item svg{width:16px;height:16px;}

        /* CSS DO MODAL DE AVATAR */
        .avatar-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-top: 20px;
            justify-items: center;
        }
        .avatar-option {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            cursor: pointer;
            border: 3px solid transparent;
            transition: all 0.2s;
            object-fit: cover;
        }
        .avatar-option:hover {
            transform: scale(1.1);
            border-color: #C1D9C1;
        }
        .avatar-option.selected {
            border-color: #667467;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
        }
      `}</style>

      <div className="container">
        {initialLoading ? (
          <main className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            <p>Carregando seu grupo...</p>
          </main>
        ) : (
          <>
            <aside className="sidebar">
              <div className="profile">
                <img src={userProfile.image} alt="perfil" />
                <span>{userProfile.name}</span>
              </div>

              <ul className="menu">
                <li><FiSettings /> Configurações</li>
                <li><FiBell /> Notificações</li>
                <li><FiUser /> Conta</li>
              </ul>

              <div className="groups">
                <p>Grupos</p>
                {groups.map(g => (
                  <div
                    key={g.id}
                    className={`group-item ${selectedGroup?.id === g.id ? 'active' : ''}`}
                    onClick={() => setSelectedGroup(g)}
                    onContextMenu={(e) => openContextMenu(e, g)}
                  >
                    <img src={g.icon} alt="grupo" />
                    {editingGroupId === g.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onBlur={saveRename}
                        onKeyDown={e => e.key === 'Enter' ? saveRename() : e.key === 'Escape' ? setEditingGroupId(null) : null}
                        autoFocus
                        style={{ fontSize: '15px', fontWeight: 500, border: '1px solid #667467', borderRadius: 4, padding: '2px 4px', width: '100%' }}
                      />
                    ) : (
                      <span>{g.name}</span>
                    )}
                  </div>
                ))}
                <div className="add-group" onClick={() => setShowCreateGroup(true)}>
                  <FiPlus style={{ fontSize: '18px' }} />
                </div>
              </div>
            </aside>

            {selectedGroup ? (
              <main className="main" ref={mainRef}>
                <div className="fixed-header">
                  <div className="header-content">
                    <img src={selectedGroup.icon} alt="grupo" style={{ width: 28, height: 28 }} />
                    <span style={{ fontSize: '18px', fontWeight: 700 }}>{selectedGroup.name}</span>
                  </div>
                  <div className="header-actions">
                    <img src="/editar.png" alt="editar" />
                    <img src="/favoritar.png" alt="favoritar" />
                    <span className="share-text">Share</span>
                  </div>
                </div>

                <div className="content">
                  <div className="title-section">
                    <div className="title-left">
                      <img src={selectedGroup.icon} alt="grupo" className="plant-large" />
                      <h1 className="group-name">{selectedGroup.name}</h1>
                      <div className="members-line">
                        <div className="profile-stack">
                          <img src="/p1.png" alt="p1" className="profile-img" />
                          <img src="/p2.png" alt="p2" className="profile-img" />
                        </div>
                        <span>Membros do grupo</span>
                      </div>
                    </div>
                  </div>

                  {/* CONTAS (DASHBOARD) - PREENCHIDO PELO CALCULAR DASHBOARD */}
                  <section className="dashboard">
                    <h3>Dashboard Financeiro</h3>
                    <div className="total-container">
                      <div className="total-value">R$ {formatCurrency(totalContas)}</div>
                      <div className="total-label">Montante total do mês</div>
                    </div>

                    <div className="bar-container">
                      <div className="bar">
                        {contas.map(c => c.valor > 0 && (
                          <div
                            key={c.id}
                            className="bar-segment"
                            style={{
                              backgroundColor: c.cor,
                              flex: `${c.valor} 1 0`,
                              minWidth: totalContas > 0 ? '10px' : '0'
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <ul className="lista-contas">
                      {contas.map(c => (
                        <li key={c.id} className="conta-item">
                          <span className="bolinha" style={{ backgroundColor: c.cor }}></span>
                          {/* Nome fixo no dashboard */}
                          <span className="conta-nome">{c.nome}</span>
                          <span className="conta-input valor-input">
                             R$ {c.valor > 0 ? formatCurrency(c.valor) : '0,00'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* TAREFAS */}
                  <section className="dashboard">
                    <h3>Tarefas</h3>
                    <div style={{ overflow: 'hidden', borderRadius: 12 }}>
                      <table className="table-container">
                        <colgroup>
                          {columnWidths.tarefas.map((w, i) => <col key={i} style={{ width: w, maxWidth: w }} />)}
                        </colgroup>
                        <thead>
                          <tr>
                            {['Check', 'Descrição', 'Status', 'Prioridade', 'Data', 'Responsável'].map((label, i) => (
                              <th key={i}>
                                <div className="th-label">
                                  {i === 0 && <FiCheck />}
                                  {i === 1 && <FiAlignLeft />}
                                  {i === 2 && <FiCheckSquare />}
                                  {i === 3 && <FiAlertCircle />}
                                  {i === 4 && <FiCalendar />}
                                  {i === 5 && <FiUser />}
                                  <span>{label}</span>
                                </div>
                                {i < 5 && (
                                  <div
                                    className="resize-handle"
                                    onPointerDown={(e) => startResize(e, 'tarefas', i)}
                                  />
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tarefas.map(t => (
                            <tr
                              key={t.id}
                              className={removingTaskId === t.id ? 'removing' : ''}
                              style={{
                                transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                                height: removingTaskId === t.id ? 0 : 'auto'
                              }}
                            >
                              <td>
                                <div
                                  className={`check-circle ${t.checked ? 'checked' : ''}`}
                                  onClick={() => handleTaskCheck(t)}
                                />
                              </td>
                              <td>
                                {t.editing || editingTask === t.id ? (
                                  <input
                                    type="text"
                                    className="edit-input"
                                    value={t.descricao}
                                    onChange={e => setTarefas(prev => prev.map(task => task.id === t.id ? { ...task, descricao: e.target.value } : task))}
                                    onBlur={() => saveTask(t.id)}
                                    onKeyDown={e => e.key === 'Enter' && saveTask(t.id)}
                                    autoFocus
                                  />
                                ) : (
                                  <span onClick={() => setEditingTask(t.id)}>{t.descricao || 'Clique para editar'}</span>
                                )}
                              </td>
                              <td>
                                <div
                                  className={`tag-display ${!t.status || t.status === 'Não começou' ? 'empty' : ''}`}
                                  style={{
                                    backgroundColor: (!t.status || t.status === 'Não começou') ? '#f3f4f6' : 
                                      t.status === 'Concluída' ? '#d5f5e3' : 
                                      t.status === 'Em andamento' ? '#fef3c7' : '#e5e7eb',
                                    color: (!t.status || t.status === 'Não começou') ? '#9ca3af' : 
                                      t.status === 'Concluída' ? '#2e7d32' : 
                                      t.status === 'Em andamento' ? '#d97706' : '#4b5563'
                                  }}
                                  onClick={() => cycleStatus(t.id)}
                                >
                                  {t.status || 'Não começou'} <FiChevronDown />
                                </div>
                              </td>
                              <td>
                                <div
                                  className="tag-display"
                                  style={{
                                    backgroundColor: t.prioridade === 'Alta' ? '#fee2e2' : t.prioridade === 'Média' ? '#f3e8ff' : '#dbeafe',
                                    color: t.prioridade === 'Alta' ? '#dc2626' : t.prioridade === 'Média' ? '#9333ea' : '#2563eb'
                                  }}
                                  onClick={() => cyclePrioridade(t.id, true)}
                                >
                                  {t.prioridade} <FiChevronDown />
                                </div>
                              </td>
                              <td>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDatePicker(showDatePicker === t.id ? null : t.id);
                                  }}
                                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                                >
                                  <FiCalendar />
                                  {t.data || 'Selecionar'}
                                </div>
                                {showDatePicker === t.id && renderDatePicker(t.id, t.data, true)}
                              </td>
                              <td>
                                <img src={t.responsavel} alt="resp" className="resp" />
                                {t.editing && (
                                  <FiTrash2 style={{ marginLeft: 8, cursor: 'pointer', color: '#dc2626' }} onClick={() => deleteTask(t.id)} />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="add-row" onClick={addTask}><FiPlus style={{ fontSize: '18px' }} /></div>
                  </section>

                  {/* LISTA DE CONTAS DETALHADA */}
                  <section className="dashboard">
                    <h3>Lista de contas</h3>
                    <div style={{ overflow: 'hidden', borderRadius: 12 }}>
                      <table className="table-container">
                        <colgroup>
                          {columnWidths.contas.map((w, i) => (
                            <col key={i} style={{ width: w, maxWidth: w }} />
                          ))}
                        </colgroup>
                        <thead>
                          <tr>
                            {[
                              'Pago?',
                              'Descrição',
                              'Categoria',
                              'Valor',
                              'Vencimento',
                              'Recorrente?',
                              'Responsável',
                            ].map((label, i) => (
                              <th key={i}>
                                <div className="th-label">
                                  {i === 0 && <FiCheck />}
                                  {i === 1 && <FiAlignLeft />}
                                  {i === 2 && <FiTag />}
                                  {i === 3 && <FiDollarSign />}
                                  {i === 4 && <FiCalendar />}
                                  {i === 5 && <FiAlertCircle />}
                                  {i === 6 && <FiUser />}
                                  <span>{label}</span>
                                </div>
                                {i < columnWidths.contas.length - 1 && (
                                  <div
                                    className="resize-handle"
                                    onPointerDown={(e) => startResize(e, 'contas', i)}
                                  />
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {contasDetalhadas.map((c) => (
                            <tr
                              key={c.id}
                              className={removingContaId === c.id ? 'removing' : ''}
                              style={{
                                transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                                height: removingContaId === c.id ? 0 : 'auto',
                              }}
                            >
                              <td>
                                <div
                                  className={`check-circle ${c.status ? 'checked' : ''}`}
                                  onClick={() => handleContaCheck(c)}
                                />
                              </td>

                              <td>
                                {c.editing || editingConta === c.id ? (
                                  <input
                                    type="text"
                                    className="edit-input"
                                    value={c.descricao}
                                    onChange={e => setContasDetalhadas(prev => prev.map(item => item.id === c.id ? { ...item, descricao: e.target.value } : item))}
                                    onBlur={() => saveContaDetalhada(c.id)}
                                    onKeyDown={e => e.key === 'Enter' && saveContaDetalhada(c.id)}
                                    autoFocus
                                  />
                                ) : (
                                  <span onClick={() => setEditingConta(c.id)}>{c.descricao || 'Nova conta'}</span>
                                )}
                              </td>

                              <td>
                                <div
                                  className="tag-display"
                                  style={{
                                    backgroundColor: '#eef2ff',
                                    color: '#3730a3',
                                  }}
                                  onClick={() => cycleCategoriaConta(c.id)}
                                >
                                  {c.categoria} <FiChevronDown />
                                </div>
                              </td>

                              <td>
                                <input
                                  type="text"
                                  className="edit-input"
                                  value={c.valor > 0 ? formatCurrency(c.valor) : ''}
                                  onChange={e => updateContaDetalhadaValor(c.id, e.target.value)}
                                  onBlur={() => saveContaDetalhada(c.id)}
                                  placeholder="R$ 0,00"
                                  style={{ width: 80, textAlign: 'right', fontFamily: 'monospace' }}
                                />
                              </td>

                              <td>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDatePicker(showDatePicker === c.id ? null : c.id);
                                  }}
                                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                                >
                                  <FiCalendar />
                                  {c.datavencimento || 'Selecionar'}
                                </div>
                                {showDatePicker === c.id && renderDatePicker(c.id, c.datavencimento, false)}
                              </td>

                              <td>
                                <div
                                  className="tag-display"
                                  style={{
                                    backgroundColor: c.recorrente ? '#dcfce7' : '#fee2e2',
                                    color: c.recorrente ? '#166534' : '#b91c1c',
                                  }}
                                  onClick={() => {
                                     const newValue = !c.recorrente;
                                     setContasDetalhadas(prev => prev.map(item => item.id === c.id ? { ...item, recorrente: newValue } : item));
                                     // Opcional: salvar imediatamente
                                  }}
                                >
                                  {c.recorrente ? 'Sim' : 'Não'}
                                </div>
                              </td>

                              <td>
                                <img src={c.responsavel} alt="resp" className="resp" />
                                {c.editing && (
                                  <FiTrash2 style={{ marginLeft: 8, cursor: 'pointer', color: '#dc2626' }} onClick={() => deleteContaDetalhada(c.id)} />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="add-row" onClick={addContaDetalhada}><FiPlus style={{ fontSize: '18px' }} /></div>
                  </section>

                  {/* LISTA DE COMPRAS */}
                  <section className="dashboard">
                    <h3>Lista de compras</h3>
                    <div style={{ overflow: 'hidden', borderRadius: 12 }}>
                      <table className="table-container">
                        <colgroup>
                          {columnWidths.compras.map((w, i) => <col key={i} style={{ width: w, maxWidth: w }} />)}
                        </colgroup>
                        <thead>
                          <tr>
                            {['Check', 'Produto', 'Tipo', 'Qtd', 'Valor', 'Prioridade', 'Responsável'].map((label, i) => (
                              <th key={i}>
                                <div className="th-label">
                                  {i === 0 && <FiCheck />}
                                  {i === 1 && <FiAlignLeft />}
                                  {i === 2 && <FiTag />}
                                  {i === 3 && <FiTag />} {/* Ícone para Qtd */}
                                  {i === 4 && <FiDollarSign />}
                                  {i === 5 && <FiAlertCircle />}
                                  {i === 6 && <FiUser />}
                                  <span>{label}</span>
                                </div>
                                {i < 6 && (
                                  <div
                                    className="resize-handle"
                                    onPointerDown={(e) => startResize(e, 'compras', i)}
                                  />
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {compras.map(c => (
                            <tr
                              key={c.id}
                              className={removingCompraId === c.id ? 'removing' : ''}
                              style={{
                                transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                                height: removingCompraId === c.id ? 0 : 'auto'
                              }}
                            >
                              <td>
                                <div
                                  className={`check-circle ${c.checked ? 'checked' : ''}`}
                                  onClick={() => handleCompraCheck(c)}
                                />
                              </td>
                              <td>
                                {c.editing || editingCompra === c.id ? (
                                  <input
                                    type="text"
                                    className="edit-input"
                                    value={c.produto}
                                    onChange={e => setCompras(prev => prev.map(compra => compra.id === c.id ? { ...compra, produto: e.target.value } : compra))}
                                    onBlur={() => saveCompra(c.id)}
                                    onKeyDown={e => e.key === 'Enter' && saveCompra(c.id)}
                                    autoFocus
                                  />
                                ) : (
                                  <span onClick={() => setEditingCompra(c.id)}>{c.produto || 'Clique para editar'}</span>
                                )}
                              </td>
                              <td>
                                <div
                                  className="tag-display"
                                  style={{
                                    backgroundColor: c.tipo === 'Limpeza' ? '#f9a8d4' : c.tipo === 'Comida' ? '#fecaca' : '#fee2e2',
                                    color: c.tipo === 'Limpeza' ? '#be185d' : c.tipo === 'Comida' ? '#991b1b' : '#ea580c'
                                  }}
                                  onClick={() => cycleTipo(c.id)}
                                >
                                  {c.tipo} <FiChevronDown />
                                </div>
                              </td>
                              {/* NOVA COLUNA DE QUANTIDADE */}
                              <td>
                                <input
                                  type="text"
                                  className="edit-input"
                                  value={c.quantidade || 1}
                                  onChange={e => updateCompraQuantidade(c.id, e.target.value)}
                                  onBlur={() => saveCompra(c.id)}
                                  style={{ width: 50, textAlign: 'center', fontFamily: 'monospace' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="edit-input"
                                  value={c.valor ? formatCurrency(parseFloat(c.valor)) : ''}
                                  onChange={e => updateCompraValor(c.id, e.target.value)}
                                  onBlur={() => saveCompra(c.id)}
                                  placeholder="R$ 0,00"
                                  style={{ width: 70, textAlign: 'right', fontFamily: 'monospace' }}
                                />
                              </td>
                              <td>
                                <div
                                  className="tag-display"
                                  style={{
                                    backgroundColor: c.prioridade === 'Alta' ? '#fee2e2' : c.prioridade === 'Média' ? '#f3e8ff' : '#dbeafe',
                                    color: c.prioridade === 'Alta' ? '#dc2626' : c.prioridade === 'Média' ? '#9333ea' : '#2563eb'
                                  }}
                                  onClick={() => cyclePrioridade(c.id, false)}
                                >
                                  {c.prioridade} <FiChevronDown />
                                </div>
                              </td>
                              <td>
                                <img src={c.responsavel} alt="resp" className="resp" />
                                {c.editing && (
                                  <FiTrash2 style={{ marginLeft: 8, cursor: 'pointer', color: '#dc2626' }} onClick={() => deleteCompra(c.id)} />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="add-row" onClick={addCompra}><FiPlus style={{ fontSize: '18px' }} /></div>
                  </section>
                </div>
              </main>
            ) : (
              <main className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                <p>Clique em + para criar ou entrar em um grupo</p>
              </main>
            )}
          </>
        )}
      </div>

      {/* MENU DE CONTEXTO */}
      {contextMenu && (
        <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={e => e.stopPropagation()}>
          <div className="context-item" onClick={() => startRename(groups.find(g => g.id === contextMenu.groupId))}>
            <FiEdit3 /> Renomear
          </div>
          <div className="context-item danger" onClick={deleteGroup}>
            <FiTrash2 /> Excluir
          </div>
        </div>
      )}

      {/* POPUP: CRIAR/ENTRAR */}
      {showCreateGroup && !initialLoading && (
        <div className="overlay" onClick={closePopups}>
          <div className="popup-card" onClick={e => e.stopPropagation()}>
            <h1 className="popup-title">Você ainda não está associado a nenhum grupo doméstico</h1>

            <form className="popup-form" onSubmit={handleJoinWithInvite}>
              <div className="conviteRow">
                <div className="inputWrapper">
                  <span className="floatingLabel">CONVITE</span>
                  <input
                    type="text"
                    className="input"
                    placeholder="Cole aqui o convite de um grupo já existente"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value)}
                  />
                </div>
                <button type="submit" className="smallButton">
                  <img src="/open.png" alt="Entrar" />
                </button>
              </div>
            </form>

            <div className="divider">
              <div className="dividerLine"></div>
              <span className="dividerText">ou</span>
              <div className="dividerLine"></div>
            </div>

            <form className="popup-form" onSubmit={handleCreateGroup}>
              <p style={{ fontSize: '16px', marginBottom: '16px', color: '#6b7280' }}>Crie o seu próprio grupo!</p>

              <div className="inputWrapper">
                <span className="floatingLabel">NOME</span>
                <input
                  type="text"
                  className="input"
                  placeholder="Digite o nome do grupo"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  required
                />
              </div>

              <div className="inputWrapper">
                <span className="floatingLabel">DESCRIÇÃO</span>
                <input
                  type="text"
                  className="input"
                  placeholder="Descreva brevemente o seu grupo"
                  value={groupDescription}
                  onChange={e => setGroupDescription(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="submitButton">
                <span>Cadastrar grupo</span>
              </button>
            </form>
          </div>
        </div>
      )}
      {/* POPUP: CÓDIGO */}
      {showInviteCode && (
        <div className="overlay" onClick={closePopups}>
          <div className="popup-invite" onClick={e => e.stopPropagation()}>
            <h2 className="invite-title">Convide amigos para o seu grupo</h2>
            <div className="codeContainer">
              <div className="codeWrapper">
                <button className="eyeButton" onClick={() => setShowCode(!showCode)} type="button">
                  <img src={showCode ? '/naover.png' : '/ver.png'} alt={showCode ? 'Ocultar' : 'Ver'} className={showCode ? 'naover' : ''} />
                </button>
                <div className="codeDisplay">
                  {showCode ? (generatedCode || 'Código não disponível') : '●●●●●●●●●●●●●●●●●●●●'}
                </div>
              </div>
              <button className={`copyButton ${copied ? 'copied' : ''}`} onClick={handleCopy} type="button">
                <img src="/copiar.png" alt="Copiar" style={{ opacity: copied ? 0 : 1 }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP: SELEÇÃO DE AVATAR (NOVO) */}
      {showAvatarModal && (
        <div className="overlay" style={{zIndex: 10001}}>
            <div className="popup-card" style={{maxWidth: '500px', textAlign: 'center'}}>
                <h2 className="popup-title">Bem-vindo(a) ao JabutiLar! 🐢</h2>
                <p style={{color: '#666', marginBottom: '20px'}}>
                    Para começar, escolha um avatar que combine com você.
                </p>
                
                <div className="avatar-grid">
                    {/* Usando os assets existentes na pasta public */}
                    <img src="/p1.png" className={`avatar-option ${userProfile.image === '/p1.png' ? 'selected' : ''}`} onClick={() => handleSelectAvatar('/p1.png')} />
                    <img src="/p2.png" className={`avatar-option ${userProfile.image === '/p2.png' ? 'selected' : ''}`} onClick={() => handleSelectAvatar('/p2.png')} />
                    <img src="/p3.png" className={`avatar-option ${userProfile.image === '/p3.png' ? 'selected' : ''}`} onClick={() => handleSelectAvatar('/p3.png')} />
                    <img src="/p4.png" className={`avatar-option ${userProfile.image === '/p4.png' ? 'selected' : ''}`} onClick={() => handleSelectAvatar('/p4.png')} />
                    
                    {/* Opções extras (repetidas para exemplo de grade) */}
                    <img src="/p1.png" style={{filter: 'hue-rotate(90deg)'}} className="avatar-option" onClick={() => handleSelectAvatar('/p1.png')} />
                    <img src="/p2.png" style={{filter: 'hue-rotate(90deg)'}} className="avatar-option" onClick={() => handleSelectAvatar('/p2.png')} />
                    <img src="/p3.png" style={{filter: 'hue-rotate(90deg)'}} className="avatar-option" onClick={() => handleSelectAvatar('/p3.png')} />
                    <img src="/p4.png" style={{filter: 'hue-rotate(90deg)'}} className="avatar-option" onClick={() => handleSelectAvatar('/p4.png')} />
                </div>
                
                <button 
                    className="submitButton" 
                    style={{marginTop: '30px'}}
                    onClick={() => handleSelectAvatar(userProfile.image)}
                >
                    <span>Confirmar Escolha</span>
                </button>
            </div>
        </div>
      )}

      {userIdDebug && (
        <div style={{
          position: 'fixed', bottom: 8, right: 8, background: '#111', color: '#fff',
          padding: '6px 10px', borderRadius: 8, fontSize: 12, zIndex: 9999, fontFamily: 'monospace'
        }}>
          UID: {userIdDebug}
        </div>
      )}
    </>
  );
}